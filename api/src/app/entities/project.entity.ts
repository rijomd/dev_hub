import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, type Relation } from 'typeorm';
import { User } from './user.entity';
import { ProjectLog } from './project-log.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  language!: string;

  @Column()
  framework!: string;

  @Column({ default: true })
  isLocal!: boolean;

  @Column({ nullable: true })
  localPath?: string;

  @Column({ nullable: true })
  gitUrl?: string;

  @Column()
  envVersion!: string;

  @Column()
  installCommand!: string;

  @Column()
  runCommand!: string;

  @Column()
  buildCommand!: string;

  @Column()
  stopCommand!: string;

  @Column({
    type: 'enum',
    enum: ['running', 'stopped', 'building'],
    default: 'stopped'
  })
  status!: 'running' | 'stopped' | 'building';

  @Column()
  port!: number;

  @ManyToOne(() => User, (user) => user.projects)
  user!: Relation<User>;

  @OneToMany(() => ProjectLog, (log) => log.project)
  logs!: Relation<ProjectLog>[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
