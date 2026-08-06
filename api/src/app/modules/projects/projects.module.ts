import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../entities/project.entity';
import { ProjectsRepository } from './projects.repository';
import { ProjectsResolver, ProjectErrorResolver } from './projects.resolver';
import { AuthModule } from '../auth/auth.module';
import { ProjectsPubSub } from './projects.pubsub';
import { ProjectsGateway } from './project.gateway';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectLog } from '../../entities/project-log.entity';
import { ProjectError } from '../../entities/project-error.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectLog, ProjectError]),
    AuthModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectsRepository, ProjectsResolver, ProjectErrorResolver, ProjectsPubSub, ProjectsGateway, ProjectService],
})
export class ProjectsModule { }
