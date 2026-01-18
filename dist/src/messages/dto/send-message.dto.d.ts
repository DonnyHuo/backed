export declare enum MessageTypeDto {
    TEXT = "TEXT",
    IMAGE = "IMAGE"
}
export declare class SendMessageDto {
    content: string;
    type?: MessageTypeDto;
}
