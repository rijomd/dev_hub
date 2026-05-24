export function LoadingFallback() {
    return (
        <div className="min-h-screen bg-[#141414] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-gray-700"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin"></div>
                </div>
                <span className="text-sm text-gray-500 tracking-wide">Loading...</span>
            </div>
        </div>
    );
}
