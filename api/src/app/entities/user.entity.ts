import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Project } from './project.entity';
import { ProjectError } from './project-error.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column()
  name!: string;

  @OneToMany(() => Project, (project) => project.user)
  projects!: Project[];

  @OneToMany(() => ProjectError, (error) => error.user)
  projectErrors!: ProjectError[];

  @CreateDateColumn()
  createdAt!: Date;
}
