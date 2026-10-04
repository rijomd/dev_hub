import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { OrganizationJoinRequest } from '../../entities/organization-join-request.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
        @InjectRepository(OrganizationJoinRequest)
        private readonly joinRequestRepo: Repository<OrganizationJoinRequest>,
    ) { }

    findByEmail(email: string) {
        return this.repo.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'name', 'userType', 'createdBy']
        });
    }

    findAll() {
        return this.repo.find({ where: { userType: 'organization' } });
    }

    createUser(data: Partial<User>) {
        const user = this.repo.create(data);
        return this.repo.save(user);
    }

    async listDevelopers(orgId: number) {
        const org = await this.repo.findOne({
            where: { id: orgId },
            relations: ['developers']
        });
        return org?.developers || [];
    }

    async createDeveloperForOrg(data: Partial<User>, orgId: number) {
        let user = await this.repo.findOne({ where: { email: data.email } });
        if (!user) {
            user = this.repo.create({ ...data, userType: 'dev', createdBy: orgId });
            user = await this.repo.save(user);
        }
        
        const org = await this.repo.findOne({ where: { id: orgId }, relations: ['developers'] });
        if (org) {
            // Check if already a developer in this org
            if (!org.developers.find(d => d.id === user.id)) {
                org.developers.push(user);
                await this.repo.save(org);
            }
        }
        return user;
    }

    async updateDeveloper(id: number, data: Partial<User>) {
        await this.repo.update(id, data);
        return this.repo.findOne({ where: { id } });
    }

    async removeDeveloperFromOrg(developerId: number, orgId: number) {
        const org = await this.repo.findOne({ where: { id: orgId }, relations: ['developers'] });
        const dev = await this.repo.findOne({ where: { id: developerId } });

        if (org && dev) {
            org.developers = org.developers.filter(d => d.id !== developerId);
            await this.repo.save(org);

            if (dev.createdBy === orgId) {
                await this.repo.remove(dev);
            }
        }
        return true;
    }

    async requestJoinOrganization(developerId: number, orgId: number) {
        const existing = await this.joinRequestRepo.findOne({
            where: { developerId, organizationId: orgId, status: 'PENDING' }
        });
        if (existing) throw new BadRequestException('Request already pending');

        const request = this.joinRequestRepo.create({
            developerId,
            organizationId: orgId
        });
        return this.joinRequestRepo.save(request);
    }

    async listPendingRequests(orgId: number) {
        return this.joinRequestRepo.find({
            where: { organizationId: orgId, status: 'PENDING' },
            relations: ['developer']
        });
    }

    async approveJoinRequest(requestId: number, orgId: number) {
        const request = await this.joinRequestRepo.findOne({ where: { id: requestId, organizationId: orgId } });
        if (!request) throw new BadRequestException('Request not found');

        request.status = 'APPROVED';
        await this.joinRequestRepo.save(request);

        const org = await this.repo.findOne({ where: { id: orgId }, relations: ['developers'] });
        const dev = await this.repo.findOne({ where: { id: request.developerId } });

        if (org && dev && !org.developers.find(d => d.id === dev.id)) {
            org.developers.push(dev);
            await this.repo.save(org);
        }
        return true;
    }

    async rejectJoinRequest(requestId: number, orgId: number) {
        const request = await this.joinRequestRepo.findOne({ where: { id: requestId, organizationId: orgId } });
        if (!request) throw new BadRequestException('Request not found');

        request.status = 'REJECTED';
        await this.joinRequestRepo.save(request);
        return true;
    }
}