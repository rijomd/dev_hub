import { Resolver, Query, Mutation, Args, Context, Int, ResolveField, Parent, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../auth/gql-jwt-auth.guard';
import { ProjectsRepository } from './projects.repository';
import { ProjectObject, CreateProjectInput, UpdateProjectInput, ProjectErrorObject } from './projects.types';
import { ProjectService } from './project.service';
import { ProjectsPubSub } from './projects.pubsub';

@Resolver(() => ProjectObject)
export class ProjectsResolver {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly projectService: ProjectService,
    private readonly pubSub: ProjectsPubSub,
  ) { }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [ProjectObject], { description: 'Get all projects for the authenticated user' })
  projects(@Context() context: any): Promise<ProjectObject[]> {
    const userId: number = context.req.user.userId;
    return this.projectsRepository.getProjects(userId) as unknown as Promise<ProjectObject[]>;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [ProjectErrorObject], { description: 'Get all project errors for the authenticated user' })
  projectErrors(@Context() context: any): Promise<ProjectErrorObject[]> {
    const userId: number = context.req.user.userId;
    return this.projectsRepository.getErrors(userId) as unknown as Promise<ProjectErrorObject[]>;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => ProjectObject, { description: 'Create a new project' })
  createProject(
    @Args('input') input: CreateProjectInput,
    @Context() context: any,
  ): Promise<ProjectObject> {
    const userId: number = context.req.user.userId;
    return this.projectsRepository.createProject(input, userId) as unknown as Promise<ProjectObject>;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => ProjectObject, { description: 'Update an existing project' })
  updateProject(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateProjectInput,
    @Context() context: any,
  ): Promise<ProjectObject> {
    const userId: number = context.req.user.userId;
    return this.projectsRepository.updateProject(id, input, userId) as unknown as Promise<ProjectObject>;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Boolean, { description: 'Delete a project by ID' })
  deleteProject(
    @Args('id', { type: () => Int }) id: number,
    @Context() context: any,
  ): Promise<boolean> {
    const userId: number = context.req.user.userId;
    return this.projectsRepository.deleteProject(id, userId);
  }

  @ResolveField(() => Int)
  uptime(@Parent() project: ProjectObject) {
    return 100;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => ProjectObject)
  runProject(
    @Args('id', { type: () => Int }) id: number,
    @Context() context: any,
  ) {
    const userId = context.req.user.userId;
    return this.projectService.run(id, userId) as unknown as Promise<ProjectObject>;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => ProjectObject)
  stopProject(
    @Args('id', { type: () => Int }) id: number,
    @Context() context: any,
  ) {
    const userId = context.req.user.userId;
    return this.projectService.stop(id, userId) as unknown as Promise<ProjectObject>;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => ProjectObject)
  buildProject(
    @Args('id', { type: () => Int }) id: number,
    @Context() context: any,
  ) {
    const userId = context.req.user.userId;
    return this.projectService.build(id, userId) as unknown as Promise<ProjectObject>;
  }

  // ← UI subscribes to this for live badge updates
  @Subscription(() => ProjectObject, {
    filter: (payload, variables) =>
      payload.projectStatusChanged.id === variables.id,
  })
  projectStatusChanged(@Args('id', { type: () => Int }) id: number) {
    return this.pubSub.asyncIterator('PROJECT_STATUS_CHANGED');
  }

}

@Resolver(() => ProjectErrorObject)
export class ProjectErrorResolver {
  @ResolveField(() => String, { nullable: true })
  details(@Parent() error: ProjectErrorObject) {
    if (error.details) {
      return typeof error.details === 'string' ? error.details : JSON.stringify(error.details);
    }
    return null;
  }
}

