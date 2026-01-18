import { FollowsService } from './follows.service';
export declare class FollowsController {
    private readonly followsService;
    constructor(followsService: FollowsService);
    toggleFollow(user: {
        id: string;
    }, userId: string): Promise<{
        followed: boolean;
        message: string;
    }>;
    checkFollowing(user: {
        id: string;
    }, userId: string): Promise<{
        isFollowing: boolean;
    }>;
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
    getMyFollowers(user: {
        id: string;
    }, page?: number, limit?: number): Promise<{
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
    getMyFollowing(user: {
        id: string;
    }, page?: number, limit?: number): Promise<{
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
