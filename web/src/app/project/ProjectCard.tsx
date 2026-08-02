import { useProjectSubscription } from '../utils/useProjectSubscription';

export const ProjectCard = ({ project, runMutation, buildMutation, stopMutation }: any) => {
    useProjectSubscription(parseInt(project.id));

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
                <span className={`w-2.5 h-2.5 rounded-full ${project.status === 'running' ? 'bg-emerald-500' :
                    project.status === 'building' ? 'bg-amber-500' : project.status === 'error' ? 'bg-red-400' :
                        'bg-gray-500'
                    }`}></span>
                <span className={project.status === 'running' ? 'text-gray-300' : ''}>{project.status}</span>
                <span>·</span>
                <span>{project.version}</span>
            </div>

            <div className="text-[13px] text-gray-500 font-mono mb-5 truncate">
                {project.path}
            </div>


            <div className="flex gap-2 mt-5">
                {['run', 'build', 'stop', 'logs'].map(action => (
                    <button
                        key={action}
                        onClick={() => {
                            if (action === 'run') runMutation.mutate(parseInt(project.id));
                            if (action === 'build') buildMutation.mutate(parseInt(project.id));
                            if (action === 'stop') stopMutation.mutate(parseInt(project.id));
                        }}
                        className="px-4 py-1.5 bg-transparent border border-gray-600 rounded-xl text-sm hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        {action}
                    </button>
                ))}
            </div>
        </div>
    );
};
