import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse, LoginInput, RegisterInput } from './auth.types';
import { UserObject } from '../user/user.types';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => UserObject, { description: 'Register a new user account' })
  async register(@Args('input') input: RegisterInput): Promise<UserObject> {
    return this.authService.register(input) as unknown as UserObject;
  }

  @Mutation(() => AuthResponse, { description: 'Login and receive a JWT token' })
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.authService.login(input);
  }

}
