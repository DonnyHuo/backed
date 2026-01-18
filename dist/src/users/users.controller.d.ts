import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            email: string | null;
            name: string | null;
            avatar: string | null;
            bio: string | null;
            backgroundImage: string | null;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            published: boolean;
            title: string;
            content: string | null;
            coverUrls: string[];
            authorId: string;
        }[];
    } & {
        id: string;
        email: string | null;
        password: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        backgroundImage: string | null;
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
        id: string;
        email: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        backgroundImage: string | null;
        walletAddress: string | null;
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
                id: string;
                email: string | null;
                name: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            published: boolean;
            title: string;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            published: boolean;
            title: string;
            content: string | null;
            coverUrls: string[];
            authorId: string;
        }[];
    } & {
        id: string;
        email: string | null;
        password: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        backgroundImage: string | null;
        role: import("@prisma/client").$Enums.Role;
        walletAddress: string | null;
        walletNonce: string | null;
        walletNonceExpiresAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, user: any): Promise<{
        id: string;
        email: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        backgroundImage: string | null;
        role: import("@prisma/client").$Enums.Role;
        updatedAt: Date;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        email: string | null;
        password: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        backgroundImage: string | null;
        role: import("@prisma/client").$Enums.Role;
        walletAddress: string | null;
        walletNonce: string | null;
        walletNonceExpiresAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
