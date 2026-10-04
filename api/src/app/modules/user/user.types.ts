import { ObjectType, Field, Int, InputType, PartialType } from '@nestjs/graphql';

@ObjectType()
export class UserObject {
  @Field(() => Int)
  id!: number;

  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field()
  userType!: string;

  @Field({ nullable: true })
  provider?: string;

  @Field({ nullable: true })
  providerUserId?: string;

  @Field({ nullable: true })
  providerOrgId?: string;

  @Field()
  createdAt!: Date;
}

@InputType()
export class CreateDeveloperInput {
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  provider?: string;

  @Field({ nullable: true })
  providerUserId?: string;
}

@InputType()
export class UpdateDeveloperInput extends PartialType(CreateDeveloperInput) {
  @Field(() => Int)
  id!: number;
}
