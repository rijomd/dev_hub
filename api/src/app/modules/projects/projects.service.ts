import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { User } from '../../entities/user.entity';
import { CreateProjectInput, UpdateProjectInput } from './projects.types';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  getProjects(userId: number): Promise<Project[]> {
    return this.projectRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async createProject(input: CreateProjectInput, userId: number): Promise<Project> {
    const project = this.projectRepo.create({
      ...input,
      status: 'stopped',
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
}
