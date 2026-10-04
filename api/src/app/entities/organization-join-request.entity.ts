import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('organization_join_requests')
export class OrganizationJoinRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'developer_id' })
  developerId!: number;

  @Column({ name: 'organization_id' })
  organizationId!: number;

  @Column({ default: 'PENDING' })
  status!: string; // PENDING, APPROVED, REJECTED

  @ManyToOne(() => User)
  @JoinColumn({ name: 'developer_id' })
  developer!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organization_id' })
  organization!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
