import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CreatePrivateConversationDto, CreateGroupConversationDto } from './dto/create-conversation.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    getConversations(user: {
        id: string;
    }): Promise<({
        unreadCount: number;
        id: any;
        type: any;
        name: any;
        avatar: any;
        otherUser: any;
        members: any;
        lastMessage: any;
        myRole: any;
        createdAt: any;
        updatedAt: any;
        ownerId?: undefined;
    } | {
        unreadCount: number;
        id: any;
        type: any;
        name: any;
        avatar: any;
        members: any;
        lastMessage: any;
        myRole: any;
        ownerId: any;
        createdAt: any;
        updatedAt: any;
        otherUser?: undefined;
    })[]>;
    createPrivateConversation(user: {
        id: string;
    }, dto: CreatePrivateConversationDto): Promise<{
        id: any;
        type: any;
        name: any;
        avatar: any;
        otherUser: any;
        members: any;
        lastMessage: any;
        myRole: any;
        createdAt: any;
        updatedAt: any;
        ownerId?: undefined;
    } | {
        id: any;
        type: any;
        name: any;
        avatar: any;
        members: any;
        lastMessage: any;
        myRole: any;
        ownerId: any;
        createdAt: any;
        updatedAt: any;
        otherUser?: undefined;
    }>;
    createGroupConversation(user: {
        id: string;
    }, dto: CreateGroupConversationDto): Promise<{
        id: any;
        type: any;
        name: any;
        avatar: any;
        otherUser: any;
        members: any;
        lastMessage: any;
        myRole: any;
        createdAt: any;
        updatedAt: any;
        ownerId?: undefined;
    } | {
        id: any;
        type: any;
        name: any;
        avatar: any;
        members: any;
        lastMessage: any;
        myRole: any;
        ownerId: any;
        createdAt: any;
        updatedAt: any;
        otherUser?: undefined;
    }>;
    getConversation(conversationId: string, user: {
        id: string;
    }): Promise<{
        id: any;
        type: any;
        name: any;
        avatar: any;
        otherUser: any;
        members: any;
        lastMessage: any;
        myRole: any;
        createdAt: any;
        updatedAt: any;
        ownerId?: undefined;
    } | {
        id: any;
        type: any;
        name: any;
        avatar: any;
        members: any;
        lastMessage: any;
        myRole: any;
        ownerId: any;
        createdAt: any;
        updatedAt: any;
        otherUser?: undefined;
    }>;
    getMessages(conversationId: string, user: {
        id: string;
    }, page?: number, limit?: number): Promise<{
        data: ({
            sender: {
                name: string | null;
                avatar: string | null;
                id: string;
            };
        } & {
            type: import("@prisma/client").$Enums.MessageType;
            id: string;
            createdAt: Date;
            content: string;
            conversationId: string;
            senderId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    sendMessage(conversationId: string, user: {
        id: string;
    }, dto: SendMessageDto): Promise<{
        sender: {
            name: string | null;
            avatar: string | null;
            id: string;
        };
    } & {
        type: import("@prisma/client").$Enums.MessageType;
        id: string;
        createdAt: Date;
        content: string;
        conversationId: string;
        senderId: string;
    }>;
    markAsRead(conversationId: string, user: {
        id: string;
    }): Promise<{
        success: boolean;
    }>;
    getUnreadCount(user: {
        id: string;
    }): Promise<{
        unreadCount: number;
    }>;
}
