import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    getProfile(user: any): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, updateUserDto: UpdateUserDto, user: any): Promise<{
        id: string;
        updatedAt: Date;
        email: string;
        name: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
    }>;
    remove(id: string, user: any): Promise<{
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
