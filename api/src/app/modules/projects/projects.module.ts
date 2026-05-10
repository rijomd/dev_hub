import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../entities/project.entity';
import { ProjectLog } from '../../entities/project-log.entity';
import { ProjectsService } from './projects.service';
import { ProjectsResolver } from './projects.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectLog]),
    AuthModule,
  ],
  providers: [ProjectsService, ProjectsResolver],
  exports: [TypeOrmModule],
})
export class ProjectsModule {}
