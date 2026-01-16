import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(createPostDto: CreatePostDto, user: any): Promise<{
        author: {
            email: string;
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
                email: string;
                name: string | null;
                avatar: string | null;
                id: string;
            };
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            published: boolean;
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
                email: string;
                name: string | null;
                avatar: string | null;
                id: string;
            };
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            published: boolean;
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
            email: string;
            name: string | null;
            avatar: string | null;
            id: string;
        };
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        published: boolean;
        content: string | null;
        coverUrls: string[];
        authorId: string;
    }>;
    toggleLike(id: string, user: any): Promise<{
        liked: boolean;
        likesCount: number;
        message: string;
    }>;
    toggleFavorite(id: string, user: any): Promise<{
        favorited: boolean;
        favoritesCount: number;
        message: string;
    }>;
    update(id: string, updatePostDto: UpdatePostDto, user: any): Promise<{
        author: {
            email: string;
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
    }>;
    togglePublish(id: string, user: any): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        published: boolean;
        content: string | null;
        coverUrls: string[];
        authorId: string;
    }>;
    remove(id: string, user: any): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        published: boolean;
        content: string | null;
        coverUrls: string[];
        authorId: string;
    }>;
}
