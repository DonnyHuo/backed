import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import {
  CreatePrivateConversationDto,
  CreateGroupConversationDto,
  UpdateGroupConversationDto,
  AddMembersDto,
} from './dto/create-conversation.dto';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for current user' })
  getConversations(@CurrentUser() user: { id: string }) {
    return this.messagesService.getConversations(user.id);
  }

  @Post('conversations/private')
  @ApiOperation({ summary: 'Create or get private conversation with a user' })
  createPrivateConversation(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePrivateConversationDto,
  ) {
    return this.messagesService.getOrCreatePrivateConversation(user.id, dto);
  }

  @Post('conversations/group')
  @ApiOperation({ summary: 'Create a group conversation' })
  createGroupConversation(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateGroupConversationDto,
  ) {
    return this.messagesService.createGroupConversation(user.id, dto);
  }

  @Get('conversations/:conversationId')
  @ApiOperation({ summary: 'Get conversation details' })
  getConversation(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.messagesService.getConversation(conversationId, user.id);
  }

  @Patch('conversations/:conversationId')
  @ApiOperation({ summary: 'Update group conversation (name, avatar)' })
  updateConversation(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateGroupConversationDto,
  ) {
    return this.messagesService.updateGroupConversation(conversationId, user.id, dto);
  }

  @Post('conversations/:conversationId/members')
  @ApiOperation({ summary: 'Add members to group conversation' })
  addMembers(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: AddMembersDto,
  ) {
    return this.messagesService.addMembers(conversationId, user.id, dto);
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMessages(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: { id: string },
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.messagesService.getMessages(
      conversationId,
      user.id,
      Number(page) || 1,
      Number(limit) || 50,
    );
  }

  @Post('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Send a message' })
  sendMessage(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(conversationId, user.id, dto);
  }

  @Patch('conversations/:conversationId/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  markAsRead(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.messagesService.markAsRead(conversationId, user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread message count' })
  getUnreadCount(@CurrentUser() user: { id: string }) {
    return this.messagesService.getUnreadCount(user.id);
  }
}

