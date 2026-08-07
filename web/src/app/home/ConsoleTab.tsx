import { useInfiniteQuery } from "@tanstack/react-query";
import { gqlRequest } from "../utils/gql-client";
import { useEffect, useRef, useCallback } from "react";
import { GET_PROJECT_ERRORS_QUERY } from "../project/query";

const PAGE_SIZE = 20;

type ErrorNode = {
    id: number;
    message: string;
    action: string;
    details?: string;
    timestamp: string;
    project?: { id: number; name: string };
};

type Edge = { cursor: string; node: ErrorNode };
type PageInfo = { hasNextPage: boolean; endCursor?: string };
type PageData = { projectErrors: { edges: Edge[]; pageInfo: PageInfo } };

export const ConsoleTab = () => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['projectErrors'],
        queryFn: async ({ pageParam }: { pageParam?: string }) =>
            await gqlRequest<PageData>(GET_PROJECT_ERRORS_QUERY, {
                first: PAGE_SIZE,
                after: pageParam ?? null,
            }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            const pageInfo = lastPage.projectErrors.pageInfo;
            return pageInfo.hasNextPage ? pageInfo.endCursor : undefined;
        },
    });

    // Sentinel ref for IntersectionObserver
    const sentinelRef = useRef<HTMLDivElement>(null);

    const handleIntersect = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        [hasNextPage, isFetchingNextPage, fetchNextPage]
    );

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleIntersect]);

    if (status === 'pending') {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-[#222222] rounded-xl animate-pulse border border-gray-700/50" />
                ))}
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#222222] border border-red-700/50 rounded-2xl text-center">
                <p className="text-red-400">Failed to load console logs.</p>
            </div>
        );
    }

    const allEdges = data?.pages.flatMap((p) => p.projectErrors.edges) ?? [];

    if (allEdges.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#222222] border border-gray-700/50 rounded-2xl text-center">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-300 font-medium">No errors logged</p>
                <p className="text-gray-500 text-sm mt-1">Your projects are running clean.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                    CONSOLE LOGS
                </h2>
                <span className="text-xs text-gray-500 bg-[#1a1a1a] px-3 py-1 rounded-full border border-gray-700">
                    {allEdges.length} loaded
                </span>
            </div>

            {/* Error cards */}
            <div className="flex flex-col gap-3">
                {allEdges.map(({ cursor, node: error }) => (
                    <div
                        key={cursor}
                        className="group bg-[#1e1e1e] border-l-4 border-l-red-500/80 p-4 rounded-xl shadow-sm border-y border-r border-gray-700/60 transition-all duration-200 hover:border-gray-600/80 hover:bg-[#242424]"
                    >
                        <div className="flex justify-between items-start gap-4 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                                    {error.action}
                                </span>
                                <h3 className="text-sm font-semibold text-gray-200">
                                    {error.project?.name ?? 'Unknown Project'}
                                </h3>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
                                {new Date(error.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{error.message}</p>
                        {error.details && (
                            <pre className="mt-3 text-xs bg-[#141414] p-3 rounded-lg text-red-300/90 overflow-x-auto border border-gray-700/50 font-mono leading-relaxed">
                                {error.details}
                            </pre>
                        )}
                    </div>
                ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="py-6 flex justify-center">
                {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-emerald-500 rounded-full animate-spin" />
                        Loading more…
                    </div>
                )}
                {!hasNextPage && allEdges.length > 0 && (
                    <p className="text-xs text-gray-600">— End of logs —</p>
                )}
            </div>
        </div>
    );
};
