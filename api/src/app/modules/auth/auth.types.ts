import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
export class AuthResponse {
  @Field()
  access_token!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;
}

@InputType()
export class RegisterInput {
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  name!: string;
}

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}
