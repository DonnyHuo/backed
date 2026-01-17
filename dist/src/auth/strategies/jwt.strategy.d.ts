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
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string | null;
            coverUrls: string[];
            published: boolean;
            authorId: string;
        }[];
    } & {
        id: string;
        email: string | null;
        password: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        role: import("@prisma/client").$Enums.Role;
        walletAddress: string | null;
        walletNonce: string | null;
        walletNonceExpiresAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
