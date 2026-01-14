import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
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
        email: string;
        password: string;
        name: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private generateToken;
}
