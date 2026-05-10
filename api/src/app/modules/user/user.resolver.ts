import { UseGuards } from "@nestjs/common";
import { Query, Resolver, Context } from "@nestjs/graphql";

import { GqlJwtAuthGuard } from "../auth/gql-jwt-auth.guard";
import { UserObject } from "./user.types";

@Resolver()
export class UserResolver {

    @UseGuards(GqlJwtAuthGuard)
    @Query(() => UserObject, { description: "get user detail" })
    async userProfile(@Context() context: any): Promise<UserObject> {
        return context.req.user;
    }


}