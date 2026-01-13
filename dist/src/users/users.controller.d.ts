import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(page?: number, limit?: number): Promise<{
        data: {
            email: string;
            name: string | null;
            avatar: string | null;
            id: string;
            role: import("@prisma/client").$Enums.Role;
            createdAt: Date;
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
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string | null;
            published: boolean;
            authorId: string;
        }[];
    } & {
        email: string;
        password: string;
        name: string | null;
        avatar: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(id: string): Promise<{
        posts: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string | null;
            published: boolean;
            authorId: string;
        }[];
    } & {
        email: string;
        password: string;
        name: string | null;
        avatar: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, user: any): Promise<{
        email: string;
        name: string | null;
        avatar: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        updatedAt: Date;
    }>;
    remove(id: string, user: any): Promise<{
        email: string;
        password: string;
        name: string | null;
        avatar: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
