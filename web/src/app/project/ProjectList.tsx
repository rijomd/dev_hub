import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gqlRequest } from "../utils/gql-client";
import { GET_PROJECTS_QUERY, RUN_PROJECT_MUTATION, BUILD_PROJECT_MUTATION, STOP_PROJECT_MUTATION, RESTART_PROJECT_MUTATION } from "./query";
import { ProjectCard } from "./ProjectCard";

type Props = {
}

export const ProjectList = ({ }: Props) => {
    const queryClient = useQueryClient();
    const { data } = useSuspenseQuery({
        queryKey: ['projects'],
        queryFn: async () => await gqlRequest(GET_PROJECTS_QUERY),
    });

    const runMutation = useMutation({
        mutationFn: async (id: number) => await gqlRequest(RUN_PROJECT_MUTATION, { id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    });

    const buildMutation = useMutation({
        mutationFn: async (id: number) => await gqlRequest(BUILD_PROJECT_MUTATION, { id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    });

    const stopMutation = useMutation({
        mutationFn: async (id: number) => await gqlRequest(STOP_PROJECT_MUTATION, { id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    });

    const restartMutation = useMutation({
        mutationFn: async (id: number) => await gqlRequest(RESTART_PROJECT_MUTATION, { id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    });

    const getBorderColor = (status: string) => {
        switch (status) {
            case 'running':
                return 'border-l-emerald-400';
            case 'building':
                return 'border-l-amber-400';
            case 'error':
                return 'border-l-red-400';
            case 'starting':
                return 'border-l-blue-400';
            case 'stopping':
                return 'border-l-orange-400';
            default:
                return 'border-l-gray-500';
        }
    };

    const getTagClass = (language: string) => {
        const lang = language?.toLowerCase() || '';
        if (lang.includes('node')) return 'bg-emerald-50 text-green-700';
        if (lang.includes('react')) return 'bg-indigo-50 text-indigo-700';
        if (lang.includes('python')) return 'bg-blue-50 text-blue-700';
        if (lang.includes('java')) return 'bg-orange-50 text-orange-700';
        if (lang.includes('js')) return 'bg-yellow-50 text-yellow-700';
        if (lang.includes('ts')) return 'bg-indigo-50 text-indigo-700';

        return 'bg-gray-100 text-gray-800';
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
                {projects.map((project: any) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        runMutation={runMutation}
                        buildMutation={buildMutation}
                        stopMutation={stopMutation}
                        restartMutation={restartMutation}
                    />
                ))}
            </div>
        </div>
    )
}
