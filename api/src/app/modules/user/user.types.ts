import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UserObject {
  @Field(() => Int)
  id!: number;

  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field()
  createdAt!: Date;
}
