import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly authService;
    constructor(authService: AuthService, configService: ConfigService);
    validate(payload: JwtPayload): Promise<{
        posts: {
            id: string;
            title: string;
            content: string | null;
            published: boolean;
            createdAt: Date;
            updatedAt: Date;
            authorId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        name: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
    }>;
}
export {};
