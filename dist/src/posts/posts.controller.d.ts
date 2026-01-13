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
        content: string | null;
        published: boolean;
        authorId: string;
    }>;
    findAll(page?: number, limit?: number, published?: boolean): Promise<{
        data: ({
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
            content: string | null;
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
    findMyPosts(user: any, page?: number, limit?: number): Promise<{
        data: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string | null;
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
    findOne(id: string): Promise<{
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
        content: string | null;
        published: boolean;
        authorId: string;
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
        content: string | null;
        published: boolean;
        authorId: string;
    }>;
    togglePublish(id: string, user: any): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        published: boolean;
        authorId: string;
    }>;
    remove(id: string, user: any): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        published: boolean;
        authorId: string;
    }>;
}
