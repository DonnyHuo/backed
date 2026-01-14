import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(createPostDto: CreatePostDto, user: any): Promise<{
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
        content: string | null;
        coverUrls: string[];
        title: string;
        published: boolean;
        authorId: string;
    }>;
    findAll(page?: number, limit?: number, published?: boolean, user?: any): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    search(keyword: string, page?: number, limit?: number, user?: any): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }> | {
        data: never[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
    findMyPosts(user: any, page?: number, limit?: number): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getLikedPosts(user: any, page?: number, limit?: number): Promise<{
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
                email: string;
                name: string | null;
                avatar: string | null;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string | null;
            coverUrls: string[];
            title: string;
            published: boolean;
            authorId: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getFavoritedPosts(user: any, page?: number, limit?: number): Promise<{
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
                email: string;
                name: string | null;
                avatar: string | null;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string | null;
            coverUrls: string[];
            title: string;
            published: boolean;
            authorId: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getCommentedPosts(user: any, page?: number, limit?: number): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user?: any): Promise<{
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
            email: string;
            name: string | null;
            avatar: string | null;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        coverUrls: string[];
        title: string;
        published: boolean;
        authorId: string;
    }>;
    toggleLike(id: string, user: any): Promise<{
        liked: boolean;
        message: string;
    }>;
    toggleFavorite(id: string, user: any): Promise<{
        favorited: boolean;
        message: string;
    }>;
    update(id: string, updatePostDto: UpdatePostDto, user: any): Promise<{
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
        content: string | null;
        coverUrls: string[];
        title: string;
        published: boolean;
        authorId: string;
    }>;
    togglePublish(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        coverUrls: string[];
        title: string;
        published: boolean;
        authorId: string;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        coverUrls: string[];
        title: string;
        published: boolean;
        authorId: string;
    }>;
}
