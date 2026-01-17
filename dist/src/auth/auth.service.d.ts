import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestNonceDto, VerifyWalletDto } from './dto/wallet-login.dto';
import { WalletVerificationService } from './services/wallet-verification.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly prisma;
    private readonly walletVerification;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService, walletVerification: WalletVerificationService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
            avatar: string | null;
            bio: any;
        };
        accessToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
            avatar: string | null;
            bio: any;
        };
        accessToken: string;
    }>;
    validateUser(payload: JwtPayload): Promise<{
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
    requestNonce(dto: RequestNonceDto): Promise<{
        nonce: string;
        message: string;
        expiresAt: Date;
    }>;
    verifyWallet(dto: VerifyWalletDto): Promise<{
        user: {
            id: string;
            email: string | null;
            walletAddress: string | null;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
            avatar: string | null;
            bio: string | null;
        };
        accessToken: string;
    }>;
    private generateToken;
}
