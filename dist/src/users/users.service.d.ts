import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        backgroundImage: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    findAll(page?: number, limit?: number): Promise<{
        data: {
            email: string | null;
            name: string | null;
            avatar: string | null;
            bio: string | null;
            backgroundImage: string | null;
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
    findById(id: string): Promise<{
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
        backgroundImage: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        walletAddress: string | null;
        walletNonce: string | null;
        walletNonceExpiresAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        email: string | null;
        password: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        backgroundImage: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        email: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        backgroundImage: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        email: string | null;
        password: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        backgroundImage: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        walletAddress: string | null;
        walletNonce: string | null;
        walletNonceExpiresAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPublicProfile(userId: string, currentUserId?: string): Promise<{
        isFollowing: boolean;
        postsCount: number;
        followersCount: number;
        followingCount: number;
        _count: undefined;
        email: string | null;
        name: string | null;
        avatar: string | null;
        bio: string | null;
        backgroundImage: string | null;
        id: string;
        walletAddress: string | null;
        createdAt: Date;
    }>;
    getUserPosts(userId: string, currentUserId?: string, page?: number, limit?: number): Promise<{
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
    getMyStats(userId: string): Promise<{
        likesReceived: number;
        favoritesReceived: number;
        postsCount: number;
        followersCount: number;
        followingCount: number;
        commentsReceived: number;
    }>;
}
