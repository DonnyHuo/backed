import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
    }>;
    findAll(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            email: string;
            name: string | null;
            avatar: string | null;
            role: import("@prisma/client").$Enums.Role;
            _count: {
                posts: number;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<{
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
    findByEmail(email: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        name: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
    } | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        updatedAt: Date;
        email: string;
        name: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
    }>;
    remove(id: string): Promise<{
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
