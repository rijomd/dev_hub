import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Project, ProjectStatus } from '../../entities/project.entity';
import { ProjectError } from '../../entities/project-error.entity';
import { User } from '../../entities/user.entity';
import { CreateProjectInput, UpdateProjectInput, ProjectErrorEdge, ProjectErrorsPage } from './projects.types';

@Injectable()
export class ProjectsRepository {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectError)
    private readonly errorRepo: Repository<ProjectError>,
  ) { }

  getProjects(userId: number): Promise<Project[]> {
    return this.projectRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getErrors(userId: number, first: number = 20, after?: string): Promise<ProjectErrorsPage> {
    const limit = first + 1;
    const where: any = { user: { id: userId } };

    if (after) {
      const decoded = Buffer.from(after, 'base64').toString('utf8');
      where.timestamp = LessThan(new Date(decoded));
    }

    const rows = await this.errorRepo.find({
      where,
      order: { timestamp: 'DESC' },
      relations: ['project'],
      take: limit,
    });

    const hasNextPage = rows.length === limit;
    const items = hasNextPage ? rows.slice(0, first) : rows;

    const edges: ProjectErrorEdge[] = items.map((item) => ({
      cursor: Buffer.from(item.timestamp.toISOString()).toString('base64'),
      node: item as any,
    }));

    const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : undefined;

    return {
      edges,
      pageInfo: { hasNextPage, endCursor },
    };
  }

  // manually handle null case
  async getProjectById(projectId: number, userId: number): Promise<Project | null> {
    return await this.projectRepo.findOne({
      where: { id: projectId, user: { id: userId } },

    });
  }

  // auto throw 404
  async getProjectByIdorFail(projectId: number): Promise<Project> {
    return await this.projectRepo.findOneByOrFail({ id: projectId });
  }


  async updateProjectStatus(id: number, status: ProjectStatus): Promise<void> {
    await this.projectRepo.update(id, { status });
  }

  async createProject(input: CreateProjectInput, userId: number): Promise<Project> {
    const project = this.projectRepo.create({
      ...input,
      status: ProjectStatus.STOPPED,
      user: { id: userId } as User,
    });
    return this.projectRepo.save(project);
  }

  async updateProject(id: number, input: UpdateProjectInput, userId: number): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }

    Object.assign(project, input);
    return this.projectRepo.save(project);
  }

  async deleteProject(id: number, userId: number): Promise<boolean> {
    const project = await this.projectRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }

    await this.projectRepo.remove(project);
    return true;
  }

  async logError(projectId: number, userId: number, action: string, message: string, details?: any): Promise<ProjectError> {
    const error = this.errorRepo.create({
      project: { id: projectId } as Project,
      user: { id: userId } as User,
      action,
      message,
      details,
    });
    return this.errorRepo.save(error);
  }
}
