import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';

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
