import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany, type Relation } from 'typeorm';
import { Project } from './project.entity';
import { ProjectError } from './project-error.entity';
import { Notification } from './notification.entity';

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

  /** Projects this user is a member of (receives notifications for). */
  @ManyToMany(() => Project, (project) => project.members)
  memberProjects!: Relation<Project>[];

  /** Notifications sent to this user by other actors. */
  @OneToMany(() => Notification, (n) => n.recipient)
  receivedNotifications!: Relation<Notification>[];

  /** Notifications triggered by this user (as the actor). */
  @OneToMany(() => Notification, (n) => n.actor)
  sentNotifications!: Relation<Notification>[];

  @CreateDateColumn()
  createdAt!: Date;
}
