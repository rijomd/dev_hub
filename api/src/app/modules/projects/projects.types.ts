import { ObjectType, Field, Int, InputType, ArgsType } from '@nestjs/graphql';

@ObjectType()
export class ProjectObject {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field()
  language!: string;

  @Field()
  framework!: string;

  @Field()
  isLocal!: boolean;

  @Field({ nullable: true })
  localPath?: string;

  @Field({ nullable: true })
  gitUrl?: string;

  @Field()
  envVersion!: string;

  @Field()
  installCommand!: string;

  @Field()
  runCommand!: string;

  @Field()
  buildCommand!: string;

  @Field()
  stopCommand!: string;

  @Field()
  status!: string;

  @Field(() => Int)
  port!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class ProjectErrorObject {
  @Field(() => Int)
  id!: number;

  @Field(() => ProjectObject, { nullable: true })
  project?: ProjectObject;

  @Field()
  message!: string;

  @Field()
  action!: string;

  @Field({ nullable: true })
  details?: string;

  @Field()
  timestamp!: Date;
}

@ObjectType()
export class PageInfo {
  @Field({ nullable: true })
  endCursor?: string;

  @Field()
  hasNextPage!: boolean;
}

@ObjectType()
export class ProjectErrorEdge {
  @Field()
  cursor!: string;

  @Field(() => ProjectErrorObject)
  node!: ProjectErrorObject;
}

@ObjectType()
export class ProjectErrorsPage {
  @Field(() => [ProjectErrorEdge])
  edges!: ProjectErrorEdge[];

  @Field(() => PageInfo)
  pageInfo!: PageInfo;
}

@ArgsType()
export class ProjectErrorsArgs {
  @Field({ nullable: true })
  after?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  first?: number;
}

@InputType()
export class CreateProjectInput {
  @Field()
  name!: string;

  @Field()
  language!: string;

  @Field()
  framework!: string;

  @Field({ nullable: true, defaultValue: true })
  isLocal?: boolean;

  @Field({ nullable: true })
  localPath?: string;

  @Field({ nullable: true })
  gitUrl?: string;

  @Field()
  envVersion!: string;

  @Field()
  installCommand!: string;

  @Field()
  runCommand!: string;

  @Field()
  buildCommand!: string;

  @Field()
  stopCommand!: string;

  @Field(() => Int)
  port!: number;
}

@InputType()
export class UpdateProjectInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  language?: string;

  @Field({ nullable: true })
  framework?: string;

  @Field({ nullable: true })
  isLocal?: boolean;

  @Field({ nullable: true })
  localPath?: string;

  @Field({ nullable: true })
  gitUrl?: string;

  @Field({ nullable: true })
  envVersion?: string;

  @Field({ nullable: true })
  installCommand?: string;

  @Field({ nullable: true })
  runCommand?: string;

  @Field({ nullable: true })
  buildCommand?: string;

  @Field({ nullable: true })
  stopCommand?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true })
  port?: number;
}
