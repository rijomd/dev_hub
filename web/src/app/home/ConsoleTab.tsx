import { useSuspenseQuery } from "@tanstack/react-query";
import { gqlRequest } from "../utils/gql-client";
import { GET_PROJECT_ERRORS_QUERY } from "../project/errorQuery";

export const ConsoleTab = () => {
    const { data } = useSuspenseQuery({
        queryKey: ['projectErrors'],
        queryFn: async () => await gqlRequest(GET_PROJECT_ERRORS_QUERY),
    });

    const errors = (data as any)?.projectErrors || [];

    if (errors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#222222] border border-gray-700/50 rounded-2xl text-center">
                <p className="text-gray-400">No errors found in your console log.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                    CONSOLE LOGS ({errors.length})
                </h2>
            </div>

            <div className="flex flex-col gap-4">
                {errors.map((error: any) => (
                    <div key={error.id} className="bg-[#222222] border-l-4 border-l-red-500 p-4 rounded-xl shadow-md border-y border-r border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-md font-bold text-gray-100">{error.project?.name || 'Unknown Project'} - {error.action}</h3>
                            <span className="text-xs text-gray-400">{new Date(error.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{error.message}</p>
                        {error.details && (
                            <pre className="mt-2 text-xs bg-[#1a1a1a] p-2 rounded text-red-300 overflow-x-auto">
                                {typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}
                            </pre>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
