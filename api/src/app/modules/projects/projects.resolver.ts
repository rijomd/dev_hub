import { Resolver, Query, Mutation, Args, Context, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../auth/gql-jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { ProjectObject, CreateProjectInput, UpdateProjectInput } from './projects.types';

@Resolver(() => ProjectObject)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) { }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [ProjectObject], { description: 'Get all projects for the authenticated user' })
  projects(@Context() context: any): Promise<ProjectObject[]> {
    const userId: number = context.req.user.userId;
    return this.projectsService.getProjects(userId) as unknown as Promise<ProjectObject[]>;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => ProjectObject, { description: 'Create a new project' })
  createProject(
    @Args('input') input: CreateProjectInput,
    @Context() context: any,
  ): Promise<ProjectObject> {
    const userId: number = context.req.user.userId;
    return this.projectsService.createProject(input, userId) as unknown as Promise<ProjectObject>;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => ProjectObject, { description: 'Update an existing project' })
  updateProject(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateProjectInput,
    @Context() context: any,
  ): Promise<ProjectObject> {
    const userId: number = context.req.user.userId;
    return this.projectsService.updateProject(id, input, userId) as unknown as Promise<ProjectObject>;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Boolean, { description: 'Delete a project by ID' })
  deleteProject(
    @Args('id', { type: () => Int }) id: number,
    @Context() context: any,
  ): Promise<boolean> {
    const userId: number = context.req.user.userId;
    return this.projectsService.deleteProject(id, userId);
  }

  @ResolveField(() => Int)
  uptime(@Parent() project: ProjectObject) {
    return 100;
  }

}
