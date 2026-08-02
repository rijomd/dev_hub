import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, type Relation } from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';

@Entity()
export class ProjectError {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Project, (project) => project.errors, { onDelete: 'CASCADE' })
  project!: Relation<Project>;

  @ManyToOne(() => User, (user) => user.projectErrors, { onDelete: 'CASCADE' })
  user!: Relation<User>;

  @Column({ type: 'text' })
  message!: string;

  @Column()
  action!: string;

  @Column({ type: 'json', nullable: true })
  details?: any;

  @CreateDateColumn()
  timestamp!: Date;
}
