import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../entities/project.entity';
import { ProjectLog } from '../../entities/project-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectLog])],
  providers: [],
  exports: [TypeOrmModule],
})
export class ProjectsModule {}
