import { PrismaService } from '../prisma/prisma.service';
export declare class FollowsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    toggleFollow(followerId: string, followingId: string): Promise<{
        followed: boolean;
        message: string;
    }>;
    isFollowing(followerId: string, followingId: string): Promise<boolean>;
    getFollowers(userId: string, page?: number, limit?: number): Promise<{
        data: {
            email: string | null;
            name: string | null;
            avatar: string | null;
            bio: string | null;
            id: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getFollowing(userId: string, page?: number, limit?: number): Promise<{
        data: {
            email: string | null;
            name: string | null;
            avatar: string | null;
            bio: string | null;
            id: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getFollowCounts(userId: string): Promise<{
        followers: number;
        following: number;
    }>;
}
