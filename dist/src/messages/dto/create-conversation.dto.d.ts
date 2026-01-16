export declare enum ConversationTypeDto {
    PRIVATE = "PRIVATE",
    GROUP = "GROUP"
}
export declare class CreatePrivateConversationDto {
    userId: string;
}
export declare class CreateGroupConversationDto {
    name: string;
    avatar?: string;
    memberIds: string[];
}
export declare class UpdateGroupConversationDto {
    name?: string;
    avatar?: string;
}
export declare class AddMembersDto {
    memberIds: string[];
}
