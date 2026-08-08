import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import { ProjectsGateway } from './project.gateway';
import { ProjectsPubSub } from './projects.pubsub';
import { Project, ProjectStatus } from '../../entities/project.entity';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectService {
    private readonly logger = new Logger(ProjectService.name);
    // in-memory process map — survives for the server lifetime
    private readonly procs = new Map<number, ChildProcess>();
    // tracks projects where a stop was intentionally requested
    private readonly stoppingProcs = new Set<number>();

    constructor(
        private readonly projectsRepository: ProjectsRepository,
        private readonly gateway: ProjectsGateway,
        private readonly pubSub: ProjectsPubSub,
    ) { }

    /** Kill a stale/zombie process for a project without waiting for 'exit' event. */
    private forceKillProc(projectId: number) {
        const proc = this.procs.get(projectId);
        if (!proc) return;
        try {
            if (process.platform === 'win32') {
                spawn('taskkill', ['/pid', proc.pid!.toString(), '/t', '/f']);
            } else {
                proc.kill('SIGKILL');
            }
        } catch (_) { /* ignore */ }
        this.procs.delete(projectId);
    }

    async run(projectId: number, userId: number): Promise<Project> {
        const project = await this.projectsRepository.getProjectById(projectId, userId);

        if (!project) {
            throw new NotFoundException(`Project #${projectId} not found`);
        }

        // If in error state, clean up any stale process and reset to stopped first
        if (project.status === ProjectStatus.ERROR) {
            this.logger.log(`Project #${projectId} is in ERROR state — resetting to STOPPED before starting`);
            this.forceKillProc(projectId);
            await this.updateStatus(project, ProjectStatus.STOPPED);
        } else if (this.procs.has(projectId)) {
            const msg = 'Project is already running';
            await this.projectsRepository.logError(projectId, userId, 'run', msg);
            throw new Error(msg);
        }

        await this.updateStatus(project, ProjectStatus.STARTING);

        const [cmd, ...args] = project.runCommand.trim().split(/\s+/);

        const proc = spawn(cmd, args, {
            cwd: project.localPath,
            shell: true,                // needed for npm scripts, npx, etc.
            env: { ...process.env },
        });

        this.procs.set(projectId, proc);

        let hasOutput = false;

        const handleOutput = async (data: Buffer) => {
            const line = data.toString();
            // push raw text to SSE stream
            this.gateway.pushLog(projectId.toString(), line);

            // first stdout → mark running
            if (!hasOutput) {
                hasOutput = true;
                await this.updateStatus(project, ProjectStatus.RUNNING);
            }
        };

        proc.stdout.on('data', handleOutput);
        proc.stderr.on('data', (data) => {
            const line = data.toString();
            this.gateway.pushLog(projectId.toString(), line, 'error');
        });

        proc.on('error', async (err) => {
            this.logger.error(`Process error [${project.name}]:`, err.message);
            this.procs.delete(projectId);
            await this.projectsRepository.logError(projectId, userId, 'run', err.message, { stack: err.stack, name: err.name });
            await this.updateStatus(project, ProjectStatus.ERROR, err.message);
        });

        proc.on('exit', async (code, signal) => {
            this.procs.delete(projectId);
            const wasIntentionallyStopped = this.stoppingProcs.delete(projectId);
            if (code === 0 || signal === 'SIGTERM' || wasIntentionallyStopped) {
                // clean exit, graceful SIGTERM, or user-requested stop (incl. Windows taskkill)
                await this.updateStatus(project, ProjectStatus.STOPPED);
            } else {
                // non-zero exit = crash
                const msg = `Process exited with code ${code}`;
                this.gateway.pushLog(projectId.toString(), msg, 'error');
                await this.projectsRepository.logError(projectId, userId, 'run', msg, { code, signal });
                await this.updateStatus(project, ProjectStatus.ERROR, msg);
            }
        });

        return this.projectsRepository.getProjectByIdorFail(projectId);
    }

    async stop(projectId: number, userId: number): Promise<Project> {
        const project = await this.projectsRepository.getProjectByIdorFail(projectId);

        // If in error state, kill any stale process and reset directly to stopped
        if (project.status === ProjectStatus.ERROR) {
            this.logger.log(`Project #${projectId} is in ERROR state — forcing reset to STOPPED`);
            this.forceKillProc(projectId);
            await this.updateStatus(project, ProjectStatus.STOPPED);
            return project;
        }

        const proc = this.procs.get(projectId);
        if (proc) {
            // Mark as intentionally stopping so the exit handler resolves to STOPPED
            this.stoppingProcs.add(projectId);
            await this.updateStatus(project, ProjectStatus.STOPPING);
            try {
                if (process.platform === 'win32') {
                    spawn('taskkill', ['/pid', proc.pid!.toString(), '/t', '/f']);
                } else {
                    proc.kill('SIGTERM');                            // graceful first
                    setTimeout(() => {
                        if (this.procs.has(projectId)) proc.kill('SIGKILL'); // force after 5s
                    }, 5000);
                }
            } catch (err: any) {
                this.stoppingProcs.delete(projectId);
                this.logger.error(`Stop error [${project.name}]:`, err.message);
                await this.projectsRepository.logError(projectId, userId, 'stop', err.message, { stack: err.stack });
                await this.updateStatus(project, ProjectStatus.ERROR, err.message);
            }
        } else {
            // Also ensure it is marked as stopped if no process is found
            await this.updateStatus(project, ProjectStatus.STOPPED);
        }

        return project;
    }

    async restart(projectId: number, userId: number): Promise<Project> {
        const project = await this.projectsRepository.getProjectByIdorFail(projectId);
        // Kill whatever is running (or stale from an error)
        this.forceKillProc(projectId);
        // Reset to STOPPED so run() can proceed cleanly
        await this.updateStatus(project, ProjectStatus.STOPPED);
        // Delegate to run() for a fresh start
        return this.run(projectId, userId);
    }

    async build(projectId: number, userId: number): Promise<Project> {
        const project = await this.projectsRepository.getProjectByIdorFail(projectId);

        // If in error state, kill any stale process and reset to stopped before building
        if (project.status === ProjectStatus.ERROR) {
            this.logger.log(`Project #${projectId} is in ERROR state — resetting to STOPPED before build`);
            this.forceKillProc(projectId);
            await this.updateStatus(project, ProjectStatus.STOPPED);
        }

        await this.updateStatus(project, ProjectStatus.BUILDING);

        const [cmd, ...args] = project.buildCommand.trim().split(/\s+/);
        const proc = spawn(cmd, args, { cwd: project.localPath, shell: true });

        proc.stdout.on('data', (d) => this.gateway.pushLog(projectId.toString(), d.toString()));
        proc.stderr.on('data', (d) => this.gateway.pushLog(projectId.toString(), d.toString(), 'error'));

        proc.on('exit', async (code) => {
            const next = code === 0 ? ProjectStatus.STOPPED : ProjectStatus.ERROR;
            const err = code !== 0 ? `Build exited with code ${code}` : undefined;
            if (code !== 0) {
                await this.projectsRepository.logError(projectId, userId, 'build', err || 'Unknown build error', { code });
            }
            await this.updateStatus(project, next, err);
        });

        return project;
    }

    private async updateStatus(
        project: Project,
        status: ProjectStatus,
        lastError?: string,
    ) {
        // lastError on project logs (track errors)
        const patch: Partial<Project> = { status };
        await this.projectsRepository.updateProjectStatus(project.id, status);

        // fire GQL subscription — every subscriber gets the new status instantly
        this.pubSub.publish('PROJECT_STATUS_CHANGED', {
            projectStatusChanged: { ...project, ...patch },
        });
    }
}