import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createPostDto: CreatePostDto, authorId: string): Promise<any>;
    findAll(page?: number, limit?: number, published?: boolean): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<any>;
    findByAuthor(authorId: string, page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    update(id: string, updatePostDto: UpdatePostDto, userId: string, userRole: string): Promise<any>;
    remove(id: string, userId: string, userRole: string): Promise<any>;
    togglePublish(id: string, userId: string, userRole: string): Promise<any>;
}
