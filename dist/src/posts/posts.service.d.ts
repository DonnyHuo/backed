import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createPostDto: CreatePostDto, authorId: string): Promise<{
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
        title: string;
        published: boolean;
        authorId: string;
    }>;
    findAll(page?: number, limit?: number, published?: boolean): Promise<{
        data: ({
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
            title: string;
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
    findById(id: string): Promise<{
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
        title: string;
        published: boolean;
        authorId: string;
    }>;
    findByAuthor(authorId: string, page?: number, limit?: number): Promise<{
        data: ({
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
            title: string;
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
    update(id: string, updatePostDto: UpdatePostDto, userId: string, userRole: string): Promise<{
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
        title: string;
        published: boolean;
        authorId: string;
    }>;
    remove(id: string, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        title: string;
        published: boolean;
        authorId: string;
    }>;
    togglePublish(id: string, userId: string, userRole: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        title: string;
        published: boolean;
        authorId: string;
    }>;
}
