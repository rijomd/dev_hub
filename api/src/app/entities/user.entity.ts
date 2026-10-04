import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
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

  @Column({ name: 'user_type', default: 'dev' })
  userType!: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy!: number;

  @Column({ nullable: true })
  provider!: string;

  @Column({ name: 'provider_user_id', nullable: true })
  providerUserId!: string;

  @Column({ name: 'provider_org_id', nullable: true })
  providerOrgId!: string;

  @OneToMany(() => Project, (project) => project.user)
  projects!: Project[];

  @OneToMany(() => ProjectError, (error) => error.user)
  projectErrors!: ProjectError[];

  @ManyToMany(() => User, (user) => user.developers)
  @JoinTable({
    name: 'user_organizations',
    joinColumn: { name: 'developer_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'organization_id', referencedColumnName: 'id' }
  })
  organizations!: User[];

  @ManyToMany(() => User, (user) => user.organizations)
  developers!: User[];

  @CreateDateColumn()
  createdAt!: Date;
}
