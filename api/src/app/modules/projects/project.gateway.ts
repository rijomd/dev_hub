import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface LogEvent { projectId: string; line: string; level: 'info' | 'error'; }

@Injectable()
export class ProjectsGateway {
    private readonly logs$ = new Subject<LogEvent>();

    pushLog(projectId: string, line: string, level: 'info' | 'error' = 'info') {
        this.logs$.next({ projectId, line, level });
    }

    // Returns an Observable<MessageEvent> that Express SSE controller subscribes to
    streamFor(projectId: string) {
        return this.logs$.pipe(
            filter((e) => e.projectId === projectId),
            map((e) => ({ data: JSON.stringify({ line: e.line, level: e.level }) })),
        );
    }
}