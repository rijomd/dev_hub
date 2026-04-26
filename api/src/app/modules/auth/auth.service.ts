import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "../user/user.repository";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService
    ) { }

    async register(body: any) {
        const { password, ...rest } = body;
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.userRepository.createUser({
            ...rest,
            password: hashedPassword
        });
    }

    async login(body: any) {
        const { email, password } = body;
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordMatching = await bcrypt.compare(password, user.password);
        if (!isPasswordMatching) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            name: user.name,
            email: user.email
        };
    }
}
