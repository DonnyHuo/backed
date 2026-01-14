import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            email: string;
            password: string;
            name: string | null;
            avatar: string | null;
            role: import("@prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
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
    getMyStats(user: any): Promise<{
        likesReceived: number;
        favoritesReceived: number;
        postsCount: number;
        followersCount: any;
        followingCount: any;
        commentsReceived: number;
    }>;
    getPublicProfile(id: string, user: any): Promise<{
        isFollowing: boolean;
        postsCount: any;
        followersCount: any;
        followingCount: any;
        _count: undefined;
        id: string;
        email: string;
        password: string;
        name: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserPosts(id: string, user: any, page?: number, limit?: number): Promise<{
        data: ({
            _count: {
                comments: number;
                likes: number;
                favorites: number;
            };
            author: {
                id: string;
                email: string;
                name: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string | null;
            coverUrls: string[];
            published: boolean;
            authorId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
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
    update(id: string, updateUserDto: UpdateUserDto, user: any): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
