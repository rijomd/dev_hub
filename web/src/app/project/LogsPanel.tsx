import { useEffect, useRef, useState } from 'react';
import { ACCESS_TOKEN, END_POINT_SSE } from '../utils/authConstants';
import { getItemLocalStorage } from '../utils/hooks';


interface LogLine {
    id: number;
    text: string;
    level: 'info' | 'error';
    /** true = came from history snapshot, false = live */
    isHistory?: boolean;
    /** sentinel type for the "── live ──" separator */
    isSeparator?: boolean;
}

interface LogsPanelProps {
    projectId: number;
    projectName: string;
    onClose: () => void;
}

/** Ring-buffer cap — keep in sync with API HISTORY_CAP */
const MAX_LINES = 500;

export const LogsPanel = ({ projectId, projectName, onClose }: LogsPanelProps) => {
    const [lines, setLines] = useState<LogLine[]>([]);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const counterRef = useRef(0);
    const esRef = useRef<EventSource | null>(null);
    /** Tracks whether the user has scrolled up so we don't force-scroll */
    const scrollerRef = useRef<HTMLDivElement>(null);
    const userScrolledUpRef = useRef(false);

    // ── Auto-scroll to bottom (unless user scrolled up) ──────────────────
    useEffect(() => {
        if (!userScrolledUpRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [lines]);

    // ── Detect manual scroll-up so we stop auto-scrolling ────────────────
    const handleScroll = () => {
        const el = scrollerRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
        userScrolledUpRef.current = !atBottom;
    };

    // ── Fetch history snapshot then open SSE stream ───────────────────────
    useEffect(() => {
        const token = getItemLocalStorage(ACCESS_TOKEN);
        if (!token) {
            setError('Not authenticated');
            return;
        }

        let cancelled = false;

        /** Step 1: load history */
        const loadHistory = async () => {
            try {
                const res = await fetch(
                    `${END_POINT_SSE}/projects/${projectId}/logs/history?token=${encodeURIComponent(token)}`,
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = (await res.json()) as { lines: { line: string; level: 'info' | 'error' }[] };
                if (cancelled) return;

                const historyLines: LogLine[] = data.lines.map((l) => ({
                    id: ++counterRef.current,
                    text: l.line,
                    level: l.level,
                    isHistory: true,
                }));

                // Always push a separator (even if history is empty — shows where live starts)
                const separator: LogLine = {
                    id: ++counterRef.current,
                    text: '',
                    level: 'info',
                    isSeparator: true,
                };

                setLines([...historyLines, separator]);
                setHistoryLoaded(true);
            } catch {
                if (!cancelled) {
                    // Non-fatal: history failed, still open SSE
                    setHistoryLoaded(true);
                }
            }
        };

        /** Step 2: open SSE for live streaming */
        const openSSE = () => {
            const url = `${END_POINT_SSE}/projects/${projectId}/logs?token=${encodeURIComponent(token)}`;
            const es = new EventSource(url);
            esRef.current = es;

            es.onopen = () => {
                if (cancelled) { es.close(); return; }
                setConnected(true);
                setError(null);
            };

            es.onmessage = (event) => {
                if (cancelled) return;
                try {
                    const payload = JSON.parse(event.data) as { line: string; level: 'info' | 'error' };
                    const rawLines = payload.line.split(/\r?\n/);
                    const newLogLines: LogLine[] = rawLines
                        .filter((l) => l.length > 0)
                        .map((text) => ({
                            id: ++counterRef.current,
                            text,
                            level: payload.level,
                            isHistory: false,
                        }));

                    setLines((prev) => {
                        const combined = [...prev, ...newLogLines];
                        // Cap total lines — trim from the top, keeping the separator
                        if (combined.length > MAX_LINES + 1) {
                            // Find separator index
                            const sepIdx = combined.findIndex((l) => l.isSeparator);
                            if (sepIdx > 0) {
                                // Trim history lines from top
                                const excess = combined.length - MAX_LINES - 1;
                                return [...combined.slice(Math.min(excess, sepIdx)), ...combined.slice(sepIdx)].slice(-MAX_LINES - 1);
                            }
                            return combined.slice(combined.length - MAX_LINES);
                        }
                        return combined;
                    });
                } catch {
                    // ignore malformed events
                }
            };

            es.onerror = () => {
                if (cancelled) return;
                setConnected(false);
                setError('Connection lost — the process may have stopped.');
            };
        };

        loadHistory().then(() => {
            if (!cancelled) openSSE();
        });

        return () => {
            cancelled = true;
            esRef.current?.close();
            esRef.current = null;
        };
    }, [projectId]);

    const handleClear = () => {
        setLines([]);
        userScrolledUpRef.current = false;
    };

    // ── Escape key closes the panel ───────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const liveLineCount = lines.filter((l) => !l.isHistory && !l.isSeparator).length;
    const historyLineCount = lines.filter((l) => l.isHistory).length;
    const totalLogLines = liveLineCount + historyLineCount;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className="fixed right-0 top-0 h-full w-full max-w-2xl z-50 flex flex-col"
                style={{
                    background: '#0d0d0d',
                    borderLeft: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
                    animation: 'slideInRight 0.25s cubic-bezier(0.22,1,0.36,1)',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-3 shrink-0"
                    style={{
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        background: '#111111',
                    }}
                >
                    <div className="flex items-center gap-3">
                        {/* Terminal icon */}
                        <span className="text-lg" style={{ fontFamily: 'monospace' }}>⌗</span>
                        <div>
                            <div className="text-sm font-semibold text-gray-100">{projectName}</div>
                            <div className="text-xs text-gray-500">logs</div>
                        </div>

                        {/* Live / Error / Connecting badge */}
                        {connected && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                                    style={{ animation: 'pulse 1.5s infinite' }} />
                                LIVE
                            </span>
                        )}
                        {!connected && !error && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ background: 'rgba(156,163,175,0.15)', color: '#9ca3af' }}>
                                Connecting…
                            </span>
                        )}
                        {error && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                                ● Disconnected
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            id={`logs-clear-${projectId}`}
                            onClick={handleClear}
                            title="Clear logs"
                            className="text-xs px-3 py-1 rounded-md transition-colors"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: '#9ca3af',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        >
                            clear
                        </button>
                        <button
                            id={`logs-close-${projectId}`}
                            onClick={onClose}
                            title="Close (Esc)"
                            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors text-gray-400"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                            onMouseLeave={e => (e.currentTarget.style.color = '')}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Scrollback info bar — like PowerShell */}
                <div
                    className="flex items-center justify-between px-5 py-1.5 text-xs shrink-0"
                    style={{
                        background: '#0f0f0f',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        color: '#4b5563',
                        fontFamily: 'monospace',
                    }}
                >
                    <span>
                        {!historyLoaded
                            ? 'Loading history…'
                            : totalLogLines === 0
                                ? 'Waiting for output…'
                                : `${totalLogLines} line${totalLogLines !== 1 ? 's' : ''}`}
                        {totalLogLines >= MAX_LINES && (
                            <span className="ml-2 text-amber-500/70">(buffer capped at {MAX_LINES})</span>
                        )}
                    </span>
                    {historyLineCount > 0 && (
                        <span style={{ color: '#374151' }}>
                            {historyLineCount} from history · {liveLineCount} live
                        </span>
                    )}
                </div>

                {/* Log output */}
                <div
                    ref={scrollerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-4 py-3"
                    style={{
                        fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, monospace',
                        fontSize: '12.5px',
                        lineHeight: '1.65',
                        color: '#d4d4d4',
                    }}
                >
                    {totalLogLines === 0 && !error && historyLoaded && (
                        <div className="flex items-center gap-2 text-gray-600 mt-4 ml-1">
                            <span style={{ animation: 'pulse 1.8s infinite', fontSize: 16 }}>▶</span>
                            <span>Waiting for output from <span className="text-gray-400">{projectName}</span>…</span>
                        </div>
                    )}

                    {error && (
                        <div
                            className="mt-4 mx-1 px-3 py-2 rounded-lg text-sm"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                            ⚠ {error}
                        </div>
                    )}

                    {lines.map((line) => {
                        // ── Separator ─────────────────────────────────────────
                        if (line.isSeparator) {
                            return (
                                <div
                                    key={line.id}
                                    className="flex items-center gap-2 my-2 select-none"
                                    style={{ color: '#2d3748' }}
                                >
                                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                    <span style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#09ed3d' }}>
                                        ── history above · live below ──
                                    </span>
                                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                </div>
                            );
                        }

                        // ── Log line ──────────────────────────────────────────
                        return (
                            <div
                                key={line.id}
                                className="flex gap-3 select-text"
                                style={{
                                    color: line.level === 'error' ? '#f87171' : line.isHistory ? '#9ca3af' : '#d4d4d4',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                    opacity: line.isHistory ? 0.75 : 1,
                                }}
                            >
                                <span
                                    style={{ color: '#374151', userSelect: 'none', minWidth: '2ch', textAlign: 'right' }}
                                >
                                    {line.level === 'error' ? '!' : line.isHistory ? '·' : '›'}
                                </span>
                                <span>{line.text}</span>
                            </div>
                        );
                    })}

                    {/* Scroll anchor */}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Keyframe styles injected inline */}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.4; }
                }
            `}</style>
        </>
    );
};
