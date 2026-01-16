import { ConfigService } from '@nestjs/config';
export declare class PusherService {
    private configService;
    private readonly logger;
    private pusher;
    constructor(configService: ConfigService);
    trigger(channel: string, event: string, data: any): Promise<void>;
    triggerBatch(events: Array<{
        channel: string;
        name: string;
        data: any;
    }>): Promise<void>;
    sendMessageNotification(conversationId: string, message: {
        id: string;
        content: string;
        type: string;
        senderId: string;
        senderName: string;
        senderAvatar?: string;
        createdAt: Date;
    }): Promise<void>;
    sendConversationUpdate(conversationId: string, event: string, data: any): Promise<void>;
    sendUserNotification(userId: string, event: string, data: any): Promise<void>;
}
