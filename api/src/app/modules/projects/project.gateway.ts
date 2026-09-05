import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface LogEvent { projectId: string; line: string; level: 'info' | 'error'; }

export interface HistoryLine { line: string; level: 'info' | 'error'; }

/** Maximum number of lines kept in memory per project (ring-buffer). */
const HISTORY_CAP = 500;

@Injectable()
export class ProjectsGateway {
    private readonly logs$ = new Subject<LogEvent>();

    /**
     * Per-project ring buffer.
     * Lives as long as the NestJS process — survives modal open/close cycles.
     */
    private readonly history = new Map<string, HistoryLine[]>();

    pushLog(projectId: string, line: string, level: 'info' | 'error' = 'info') {
        // Split multi-line chunks so each entry in the buffer is a single line
        const rawLines = line.split(/\r?\n/).filter((l) => l.length > 0);

        for (const rawLine of rawLines) {
            // Append to ring buffer
            if (!this.history.has(projectId)) {
                this.history.set(projectId, []);
            }
            const buf = this.history.get(projectId)!;
            buf.push({ line: rawLine, level });
            // Cap the buffer — drop oldest entries
            if (buf.length > HISTORY_CAP) {
                buf.splice(0, buf.length - HISTORY_CAP);
            }
        }

        // Emit the original (un-split) chunk to SSE subscribers as before
        this.logs$.next({ projectId, line, level });
    }

    /**
     * Returns the buffered lines for a project (up to HISTORY_CAP).
     * Called by the REST history endpoint so new modal mounts can seed
     * their display before the SSE connection is established.
     */
    getHistory(projectId: string): HistoryLine[] {
        return this.history.get(projectId) ?? [];
    }

    /** Clear the ring buffer for a project (e.g. when the user clicks "clear"). */
    clearHistory(projectId: string) {
        this.history.delete(projectId);
    }

    // Returns an Observable<MessageEvent> that Express SSE controller subscribes to
    streamFor(projectId: string) {
        return this.logs$.pipe(
            filter((e) => e.projectId === projectId),
            map((e) => ({ data: JSON.stringify({ line: e.line, level: e.level }) })),
        );
    }
}