import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../entities/project.entity';
import { ProjectsRepository } from './projects.repository';
import { ProjectsResolver } from './projects.resolver';
import { AuthModule } from '../auth/auth.module';
import { ProjectsPubSub } from './projects.pubsub';
import { ProjectsGateway } from './project.gateway';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectLog } from '../../entities/project-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectLog]),
    AuthModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectsRepository, ProjectsResolver, ProjectsPubSub, ProjectsGateway, ProjectService],
})
export class ProjectsModule { }
