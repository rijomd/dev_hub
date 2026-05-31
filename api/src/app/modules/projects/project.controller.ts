import { Controller, Param, Sse, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsGateway } from './project.gateway';

/**
 * Server sent events for logs
 * GET /projects/:id/logs
 */
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
    constructor(private readonly gateway: ProjectsGateway) { }

    @Sse(':id/logs')
    streamLogs(@Param('id') id: string): Observable<MessageEvent> {
        return this.gateway.streamFor(id) as any;
    }
}