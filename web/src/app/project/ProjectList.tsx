import { useSuspenseQuery } from "@tanstack/react-query";
import { client } from "../utils/gql-client";
import { GET_PROJECTS_QUERY } from "./query";

type Props = {
}

export const ProjectList = ({ }: Props) => {
    const { data } = useSuspenseQuery({
        queryKey: ['projects'],
        queryFn: async () => await client.request(GET_PROJECTS_QUERY),
    });

    const getBorderColor = (status: string) => {
        switch (status) {
            case 'running':
                return 'border-l-emerald-400';
            case 'building':
                return 'border-l-amber-400';
            case 'error':
                return 'border-l-red-400';
            default:
                return 'border-l-gray-500';
        }
    };

    const getTagClass = (language: string) => {
        switch (language?.toLowerCase()) {
            case 'nodejs':
                return 'bg-emerald-50 text-emerald-700';
            case 'react':
                return 'bg-indigo-50 text-indigo-700';
            case 'python':
                return 'bg-blue-50 text-blue-700';
            case 'java':
                return 'bg-orange-50 text-orange-700';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const rawProjects = (data as any)?.projects || [];
    const projects = rawProjects.map((project: any) => ({
        ...project,
        type: project.language,
        version: project.envVersion,
        path: project.isLocal ? project.localPath : project.gitUrl,
        borderColor: getBorderColor(project.status),
        tagClass: getTagClass(project.language),
    }));

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#222222] border border-gray-700/50 rounded-2xl text-center">
                <p className="text-gray-400">No projects found. Add your first project!</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                    YOUR PROJECTS ({projects.length})
                </h2>
                <button
                    className="px-4 py-1.5 bg-transparent border border-gray-600 hover:border-gray-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <span>+</span> add project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project: any, idx: number) => (
                    <div key={idx} className={`bg-[#222222] border border-gray-700/50 rounded-xl p-5 ${project.borderColor} border-l-[3px] hover:border-gray-500 transition-colors`}>
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

                        <div className="flex gap-2">
                            {['run', 'build', 'stop', 'logs'].map(action => (
                                <button key={action} className="px-4 py-1.5 bg-transparent border border-gray-600 rounded-xl text-sm hover:bg-gray-700 hover:text-white transition-colors">
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
