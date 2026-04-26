
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
            select: ['id', 'email', 'password', 'name']
        });
    }

    createUser(data: Partial<User>) {
        const user = this.repo.create(data);
        return this.repo.save(user);
    }
}