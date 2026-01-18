import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CoverService } from '../cover/cover.service';
export declare class PostsService {
    private readonly prisma;
    private readonly coverService;
    constructor(prisma: PrismaService, coverService: CoverService);
    create(createPostDto: CreatePostDto, authorId: string): Promise<{
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
    }>;
    findAll(page?: number, limit?: number, published?: boolean, userId?: string): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string, userId?: string): Promise<{
        isLiked: boolean;
        isFavorited: boolean;
        likes: undefined;
        favorites: undefined;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        published: boolean;
        title: string;
        content: string | null;
        coverUrls: string[];
        authorId: string;
    }>;
    findByAuthor(authorId: string, page?: number, limit?: number, userId?: string): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    update(id: string, updatePostDto: UpdatePostDto, userId: string, userRole: string): Promise<{
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
    }>;
    remove(id: string, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        published: boolean;
        title: string;
        content: string | null;
        coverUrls: string[];
        authorId: string;
    }>;
    togglePublish(id: string, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        published: boolean;
        title: string;
        content: string | null;
        coverUrls: string[];
        authorId: string;
    }>;
    toggleLike(postId: string, userId: string): Promise<{
        liked: boolean;
        likesCount: number;
        message: string;
    }>;
    toggleFavorite(postId: string, userId: string): Promise<{
        favorited: boolean;
        favoritesCount: number;
        message: string;
    }>;
    getUserLikedPosts(userId: string, page?: number, limit?: number): Promise<{
        data: {
            isLiked: boolean;
            likedAt: Date;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            published: boolean;
            title: string;
            content: string | null;
            coverUrls: string[];
            authorId: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUserFavoritedPosts(userId: string, page?: number, limit?: number): Promise<{
        data: {
            isFavorited: boolean;
            favoritedAt: Date;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            published: boolean;
            title: string;
            content: string | null;
            coverUrls: string[];
            authorId: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUserCommentedPosts(userId: string, page?: number, limit?: number): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    search(keyword: string, page?: number, limit?: number, userId?: string): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
