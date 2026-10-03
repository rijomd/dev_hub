import {
  Controller,
  Post,
  Headers,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  Logger,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
import { NotificationsService, GitHubPushPayload } from './notifications.service';

/** Express Request extended with the rawBody buffer injected by NestJS when rawBody:true is set. */
interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

/**
 * POST /webhooks/github
 *
 * Public endpoint — GitHub calls this when an event occurs on any
 * registered repository. No JWT auth here; security is handled via
 * HMAC-SHA256 signature validation using the shared webhook secret.
 *
 * To receive the raw body for signature validation, NestJS must be
 * configured with `rawBody: true` in bootstrap (main.ts).
 */
@Controller('webhooks')
export class GitHubWebhookController {
  private readonly logger = new Logger(GitHubWebhookController.name);

  constructor(private readonly notificationsService: NotificationsService) { }

  @Post('github')
  @HttpCode(HttpStatus.ACCEPTED)
  async handleGitHubWebhook(
    @Headers('x-github-event') eventName: string,
    @Headers('x-hub-signature-256') signature: string,
    @Headers('x-github-delivery') deliveryId: string,
    @Req() req: RawBodyRequest,
    @Body() payload: any,
  ): Promise<{ ok: boolean }> {
    // 1 – Validate HMAC signature
    this.verifySignature(req.rawBody, signature);

    this.logger.log(
      `GitHub webhook received: event="${eventName}" delivery="${deliveryId}"`,
    );

    // 2 – Route to the correct handler
    switch (eventName) {
      case 'push':
        await this.handlePushEvent(payload as GitHubPushPayload);
        break;

      case 'ping':
        // GitHub sends a ping when a webhook is first created — just ack it.
        this.logger.log(`Webhook ping received for repo: ${payload?.repository?.full_name}`);
        break;

      default:
        // Unknown or unhandled event — ack anyway so GitHub doesn't retry.
        this.logger.debug(`Unhandled GitHub event type: "${eventName}"`);
    }

    return { ok: true };
  }

  // ─── Event handlers ───────────────────────────────────────────────────────

  private async handlePushEvent(payload: GitHubPushPayload): Promise<void> {
    if (!payload?.repository?.id) {
      throw new BadRequestException('Invalid push payload: missing repository.id');
    }

    // Ignore branch deletions (after === all-zeros SHA)
    if (payload.after === '0000000000000000000000000000000000000000') {
      this.logger.debug(`Ignoring branch deletion push event`);
      return;
    }

    await this.notificationsService.handleGitPush(payload);
  }

  // ─── Signature validation ─────────────────────────────────────────────────

  /**
   * Validates the X-Hub-Signature-256 header against the raw request body
   * using HMAC-SHA256 and the GITHUB_WEBHOOK_SECRET env var.
   *
   * @see https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
   */
  private verifySignature(rawBody: Buffer | undefined, signature: string): void {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!secret) {
      this.logger.warn('GITHUB_WEBHOOK_SECRET is not set — skipping signature verification!');
      return;
    }

    if (!signature) {
      throw new UnauthorizedException('Missing X-Hub-Signature-256 header');
    }

    if (!rawBody) {
      throw new BadRequestException('Raw body unavailable — ensure rawBody:true in NestJS bootstrap');
    }

    const expectedSignature =
      'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }
}
