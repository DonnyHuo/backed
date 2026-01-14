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
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getFollowing(userId: string, page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getFollowCounts(userId: string): Promise<{
        followers: any;
        following: any;
    }>;
}
