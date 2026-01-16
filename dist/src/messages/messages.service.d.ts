import { PrismaService } from '../prisma/prisma.service';
import { PusherService } from '../pusher/pusher.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CreatePrivateConversationDto, CreateGroupConversationDto, UpdateGroupConversationDto, AddMembersDto } from './dto/create-conversation.dto';
export declare class MessagesService {
    private readonly prisma;
    private readonly pusher;
    constructor(prisma: PrismaService, pusher: PusherService);
    getOrCreatePrivateConversation(currentUserId: string, dto: CreatePrivateConversationDto): Promise<{
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
    createGroupConversation(currentUserId: string, dto: CreateGroupConversationDto): Promise<{
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
    getConversations(userId: string): Promise<({
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
    getConversation(conversationId: string, userId: string): Promise<{
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
    getMessages(conversationId: string, userId: string, page?: number, limit?: number): Promise<{
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
    sendMessage(conversationId: string, userId: string, dto: SendMessageDto): Promise<{
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
    markAsRead(conversationId: string, userId: string): Promise<{
        success: boolean;
    }>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    updateGroupConversation(conversationId: string, userId: string, dto: UpdateGroupConversationDto): Promise<{
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
    addMembers(conversationId: string, userId: string, dto: AddMembersDto): Promise<{
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
    private formatConversation;
}
