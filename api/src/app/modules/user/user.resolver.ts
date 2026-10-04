import { UseGuards, UnauthorizedException } from "@nestjs/common";
import { Query, Resolver, Context, Mutation, Args, Int } from "@nestjs/graphql";

import { GqlJwtAuthGuard } from "../auth/gql-jwt-auth.guard";
import { UserObject, CreateDeveloperInput, UpdateDeveloperInput } from "./user.types";
import { UserRepository } from "./user.repository";
import * as bcrypt from 'bcrypt';

@Resolver()
export class UserResolver {
    constructor(private readonly userRepository: UserRepository) {}

    @UseGuards(GqlJwtAuthGuard)
    @Query(() => UserObject, { description: "get user detail" })
    async userProfile(@Context() context: any): Promise<UserObject> {
        return context.req.user;
    }

    @UseGuards(GqlJwtAuthGuard)
    @Query(() => [UserObject], { description: "List all developers under an organization" })
    async listDevelopers(@Context() context: any): Promise<UserObject[]> {
        const user = context.req.user;
        if (user.userType !== 'organization') {
            throw new UnauthorizedException('Only organizations can list developers');
        }
        return this.userRepository.listDevelopers(user.id) as unknown as UserObject[];
    }

    @UseGuards(GqlJwtAuthGuard)
    @Mutation(() => UserObject, { description: "Create a developer for an organization" })
    async createDeveloper(
        @Args('input') input: CreateDeveloperInput,
        @Context() context: any
    ): Promise<UserObject> {
        const user = context.req.user;
        if (user.userType !== 'organization') {
            throw new UnauthorizedException('Only organizations can create developers');
        }

        const { password, ...rest } = input;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const devData = {
            ...rest,
            password: hashedPassword
        };
        
        return this.userRepository.createDeveloperForOrg(devData, user.id) as unknown as UserObject;
    }

    @UseGuards(GqlJwtAuthGuard)
    @Mutation(() => UserObject, { description: "Update a developer" })
    async updateDeveloper(
        @Args('input') input: UpdateDeveloperInput,
        @Context() context: any
    ): Promise<UserObject> {
        const user = context.req.user;
        if (user.userType !== 'organization') {
            throw new UnauthorizedException('Only organizations can update developers');
        }

        const { id, password, ...rest } = input;
        let updateData: any = { ...rest };
        
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        
        return this.userRepository.updateDeveloper(id, updateData) as unknown as UserObject;
    }

    @UseGuards(GqlJwtAuthGuard)
    @Mutation(() => Boolean, { description: "Remove a developer from an organization" })
    async removeDeveloper(
        @Args('id', { type: () => Int }) id: number,
        @Context() context: any
    ): Promise<boolean> {
        const user = context.req.user;
        if (user.userType !== 'organization') {
            throw new UnauthorizedException('Only organizations can remove developers');
        }

        return this.userRepository.removeDeveloperFromOrg(id, user.id);
    }
}