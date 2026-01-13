import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(createCommentDto: CreateCommentDto, user: any): Promise<{
        author: {
            id: string;
            email: string;
            name: string | null;
            avatar: string | null;
        };
    } & {
        id: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        postId: string;
    }>;
    findByPost(postId: string): Promise<({
        author: {
            id: string;
            email: string;
            name: string | null;
            avatar: string | null;
        };
    } & {
        id: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        postId: string;
    })[]>;
    remove(id: string, user: any): Promise<{
        id: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        postId: string;
    }>;
}
