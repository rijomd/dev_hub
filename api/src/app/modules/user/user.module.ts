import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../entities/user.entity';
import { OrganizationJoinRequest } from '../../entities/organization-join-request.entity';
import { UserRepository } from './user.repository';
import { UserResolver } from './user.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, OrganizationJoinRequest]), forwardRef(() => AuthModule)],
  providers: [UserRepository, UserResolver],
  exports: [UserRepository],
})
export class UserModule { }
