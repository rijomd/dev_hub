import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, type Relation } from 'typeorm';
import { Project } from './project.entity';

@Entity()
export class ProjectLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Project, (project) => project.logs)
  project!: Relation<Project>;

  @Column({ type: 'text' })
  message!: string;

  @Column()
  level!: string;

  @CreateDateColumn()
  timestamp!: Date;
}
