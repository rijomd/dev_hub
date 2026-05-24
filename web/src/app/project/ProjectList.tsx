
type Props = {
    mockProjects: any[]
}

export const ProjectList = ({ mockProjects }: Props) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                    YOUR PROJECTS ({mockProjects.length})
                </h2>
                <button
                    className="px-4 py-1.5 bg-transparent border border-gray-600 hover:border-gray-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <span>+</span> add project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockProjects.map((project, idx) => (
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
                                project.status === 'building' ? 'bg-amber-500' :
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
