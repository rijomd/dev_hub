import { Controller, Get, Param, Query, Sse, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ProjectsGateway, HistoryLine } from './project.gateway';

/**
 * Server sent events + REST history for project logs.
 *
 * GET /projects/:id/logs?token=<jwt>          → SSE stream (live)
 * GET /projects/:id/logs/history?token=<jwt>  → JSON snapshot of ring buffer
 *
 * EventSource (browser) cannot send custom headers, so the JWT arrives
 * as a query-param instead of the Authorization header.
 */
@Controller('projects')
export class ProjectController {
    constructor(
        private readonly gateway: ProjectsGateway,
        private readonly jwtService: JwtService,
    ) { }

    /** Verify token helper — throws UnauthorizedException on failure. */
    private verifyToken(token: string | undefined): void {
        if (!token) {
            throw new UnauthorizedException('Missing token');
        }
        try {
            this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    /** Live SSE stream — browsers connect via EventSource. */
    @Sse(':id/logs')
    streamLogs(
        @Param('id') id: string,
        @Query('token') token: string,
    ): Observable<MessageEvent> {
        this.verifyToken(token);
        return this.gateway.streamFor(id) as any;
    }

    /**
     * History snapshot — returns the buffered lines as JSON.
     * The frontend fetches this on modal mount to seed the display
     * immediately, before the SSE connection is even established.
     */
    @Get(':id/logs/history')
    getLogsHistory(
        @Param('id') id: string,
        @Query('token') token: string,
    ): { lines: HistoryLine[] } {
        this.verifyToken(token);
        return { lines: this.gateway.getHistory(id) };
    }
}