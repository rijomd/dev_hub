import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
    ) { }

    findByEmail(email: string) {
        return this.repo.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'name', 'userType']
        });
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
            user = this.repo.create({ ...data, userType: 'dev' });
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
        if (org) {
            org.developers = org.developers.filter(dev => dev.id !== developerId);
            await this.repo.save(org);
        }
        return true;
    }
}