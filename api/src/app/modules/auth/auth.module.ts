import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AuthService } from "./auth.service";
import { AuthResolver } from "./auth.resolver";

import { UserModule } from "../user/user.module";

import { JwtStrategy } from "./jwt.strategy";
import { GqlJwtAuthGuard } from "./gql-jwt-auth.guard";

@Module({
    imports: [
        forwardRef(() => UserModule),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
    ],
    providers: [AuthService, AuthResolver, GqlJwtAuthGuard, JwtStrategy],
    exports: [GqlJwtAuthGuard],
})
export class AuthModule { }
