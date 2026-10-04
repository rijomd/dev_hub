import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';

@ObjectType()
export class AuthResponse {
  @Field()
  access_token!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  userType!: string;

  @Field(() => Int, { nullable: true })
  createdBy?: number;
}

@InputType()
export class RegisterInput {
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  userType?: string;
}

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}
