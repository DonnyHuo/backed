import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(page?: number, limit?: number): Promise<{
        data: {
            email: string | null;
            name: string | null;
            avatar: string | null;
            bio: string | null;
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
            published: boolean;
            content: string | null;
            coverUrls: string[];
            authorId: string;
        }[];
    } & {
        email: string | null;
        password: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        walletAddress: string | null;
        walletNonce: string | null;
        walletNonceExpiresAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMyStats(user: any): Promise<{
        likesReceived: number;
        favoritesReceived: number;
        postsCount: number;
        followersCount: number;
        followingCount: number;
        commentsReceived: number;
    }>;
    getPublicProfile(id: string, user: any): Promise<{
        isFollowing: boolean;
        postsCount: number;
        followersCount: number;
        followingCount: number;
        _count: undefined;
        email: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        id: string;
        createdAt: Date;
    }>;
    getUserStats(id: string): Promise<{
        likesReceived: number;
        favoritesReceived: number;
        postsCount: number;
        followersCount: number;
        followingCount: number;
        commentsReceived: number;
    }>;
    getUserPosts(id: string, user: any, page?: number, limit?: number): Promise<{
        data: ({
            _count: {
                comments: number;
                likes: number;
                favorites: number;
            };
            author: {
                email: string | null;
                name: string | null;
                avatar: string | null;
                id: string;
            };
        } & {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            published: boolean;
            content: string | null;
            coverUrls: string[];
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
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            published: boolean;
            content: string | null;
            coverUrls: string[];
            authorId: string;
        }[];
    } & {
        email: string | null;
        password: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        walletAddress: string | null;
        walletNonce: string | null;
        walletNonceExpiresAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, user: any): Promise<{
        email: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        updatedAt: Date;
    }>;
    remove(id: string, user: any): Promise<{
        email: string | null;
        password: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        walletAddress: string | null;
        walletNonce: string | null;
        walletNonceExpiresAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
