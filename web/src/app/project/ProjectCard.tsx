import { useProjectSubscription } from '../utils/useProjectSubscription';

export const ProjectCard = ({ project, runMutation, buildMutation, stopMutation, restartMutation }: any) => {
    useProjectSubscription(parseInt(project.id));

    const id = parseInt(project.id);
    const status: string = project.status;

    /** Derive which action buttons to show based on current status */
    const getActions = () => {
        switch (status) {
            case 'running':
                return ['restart', 'stop', 'logs'];
            case 'error':
                return ['restart', 'logs'];
            case 'starting':
            case 'stopping':
            case 'building':
                return ['logs'];  // transitional — no actions while in-flight
            default: // stopped
                return ['run', 'build', 'logs'];
        }
    };

    const handleAction = (action: string) => {
        if (action === 'run') runMutation.mutate(id);
        if (action === 'build') buildMutation.mutate(id);
        if (action === 'stop') stopMutation.mutate(id);
        if (action === 'restart') restartMutation.mutate(id);
    };

    const actionLabel: Record<string, string> = {
        run: '▶ run',
        build: '⚙ build',
        stop: '■ stop',
        restart: '↺ restart',
        logs: '☰ logs',
    };

    const actionClass: Record<string, string> = {
        run: 'border-emerald-600/60 hover:bg-emerald-700/30 hover:text-emerald-300',
        build: 'border-amber-600/60 hover:bg-amber-700/30 hover:text-amber-300',
        stop: 'border-orange-600/60 hover:bg-orange-700/30 hover:text-orange-300',
        restart: 'border-blue-600/60 hover:bg-blue-700/30 hover:text-blue-300',
        logs: 'border-gray-600 hover:bg-gray-700/40 hover:text-white',
    };

    return (
        <div className={`bg-[#222222] border border-gray-700/50 rounded-xl p-5 ${project.borderColor} border-l-[3px] hover:border-gray-500 transition-colors`}>
            <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold text-gray-100">{project.name}</h3>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${project.tagClass}`}>
                    {project.type}
                </span>
            </div>

            <div className="text-sm text-gray-400 mb-4">
                {project.framework} · port {project.port}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <span className={`w-2.5 h-2.5 rounded-full ${status === 'running' ? 'bg-emerald-500 animate-pulse' :
                    status === 'building' ? 'bg-amber-500  animate-pulse' :
                        status === 'error' ? 'bg-red-400' :
                            status === 'starting' ? 'bg-blue-400   animate-pulse' :
                                status === 'stopping' ? 'bg-orange-400 animate-pulse' :
                                    'bg-gray-500'
                    }`} />
                <span className={status === 'running' ? 'text-gray-300' : status === 'error' ? 'text-red-400' : ''}>{status}</span>
                <span>·</span>
                <span>{project.version}</span>
            </div>

            <div className="text-[13px] text-gray-500 font-mono mb-5 truncate">
                {project.path}
            </div>

            <div className="flex gap-2 mt-5 flex-wrap">
                {getActions().map(action => (
                    <button
                        key={action}
                        onClick={() => handleAction(action)}
                        className={`px-4 py-1.5 bg-transparent border rounded-xl text-sm transition-colors ${actionClass[action]}`}
                    >
                        {actionLabel[action]}
                    </button>
                ))}
            </div>
        </div>
    );
};
