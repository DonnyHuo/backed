import { IsString, IsOptional, IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConversationTypeDto {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
}

export class CreatePrivateConversationDto {
  @ApiProperty({ example: 'userId123', description: 'User ID to chat with' })
  @IsString()
  userId: string;
}

export class CreateGroupConversationDto {
  @ApiProperty({ example: 'My Group Chat' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ example: ['userId1', 'userId2'], description: 'Initial member IDs' })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  memberIds: string[];
}

export class UpdateGroupConversationDto {
  @ApiPropertyOptional({ example: 'New Group Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class AddMembersDto {
  @ApiProperty({ example: ['userId1', 'userId2'], description: 'Member IDs to add' })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  memberIds: string[];
}

