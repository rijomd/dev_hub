import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { Project } from './project.entity';

export enum GitProvider {
  GITHUB = 'github',
  GITLAB = 'gitlab',
  BITBUCKET = 'bitbucket',
}

@Entity()
export class GitRepository {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Project, (project) => project.gitRepositories, {
    onDelete: 'CASCADE',
  })
  project!: Relation<Project>;

  @Column({ type: 'varchar', default: GitProvider.GITHUB })
  provider!: GitProvider;

  /** The numeric/string repo ID returned by the git host (e.g. GitHub repo id). */
  @Column({ unique: true })
  repositoryExternalId!: string;

  @Column()
  repoName!: string;

  @Column()
  repoUrl!: string;

  /** GitHub webhook ID stored so we can delete it later. */
  @Column({ nullable: true })
  webhookId?: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
