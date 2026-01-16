import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PusherService } from '../pusher/pusher.service';
import { SendMessageDto } from './dto/send-message.dto';
import {
  CreatePrivateConversationDto,
  CreateGroupConversationDto,
  UpdateGroupConversationDto,
  AddMembersDto,
} from './dto/create-conversation.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pusher: PusherService,
  ) {}

  /**
   * Get or create a private conversation with another user
   */
  async getOrCreatePrivateConversation(
    currentUserId: string,
    dto: CreatePrivateConversationDto,
  ) {
    const { userId: otherUserId } = dto;

    // Can't chat with yourself
    if (currentUserId === otherUserId) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    // Check if other user exists
    const otherUser = await this.prisma.user.findUnique({
      where: { id: otherUserId },
    });
    if (!otherUser) {
      throw new NotFoundException('User not found');
    }

    // Check if private conversation already exists between these two users
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        type: 'PRIVATE',
        AND: [
          { members: { some: { userId: currentUserId } } },
          { members: { some: { userId: otherUserId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (existingConversation) {
      return this.formatConversation(existingConversation, currentUserId);
    }

    // Create new private conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        type: 'PRIVATE',
        members: {
          create: [{ userId: currentUserId }, { userId: otherUserId }],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return this.formatConversation(conversation, currentUserId);
  }

  /**
   * Create a group conversation
   */
  async createGroupConversation(currentUserId: string, dto: CreateGroupConversationDto) {
    const { name, avatar, memberIds } = dto;

    // Add current user to members if not included
    const allMemberIds = [...new Set([currentUserId, ...memberIds])];

    // Verify all members exist
    const users = await this.prisma.user.findMany({
      where: { id: { in: allMemberIds } },
    });
    if (users.length !== allMemberIds.length) {
      throw new BadRequestException('One or more users not found');
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        name,
        avatar,
        type: 'GROUP',
        ownerId: currentUserId,
        members: {
          create: allMemberIds.map((userId) => ({
            userId,
            role: userId === currentUserId ? 'OWNER' : 'MEMBER',
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    // Notify all members about the new group
    for (const memberId of allMemberIds) {
      if (memberId !== currentUserId) {
        await this.pusher.sendUserNotification(memberId, 'new-conversation', {
          conversationId: conversation.id,
          name: conversation.name,
          type: 'GROUP',
        });
      }
    }

    return this.formatConversation(conversation, currentUserId);
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get unread counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const member = conv.members.find((m) => m.userId === userId);
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            createdAt: member?.lastReadAt ? { gt: member.lastReadAt } : undefined,
          },
        });
        return { ...this.formatConversation(conv, userId), unreadCount };
      }),
    );

    return conversationsWithUnread;
  }

  /**
   * Get a single conversation
   */
  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, bio: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.formatConversation(conversation, userId);
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    // Verify user is a member
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        userId_conversationId: { userId, conversationId },
      },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      data: messages.reverse(), // Return in chronological order
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Send a message
   */
  async sendMessage(conversationId: string, userId: string, dto: SendMessageDto) {
    // Verify user is a member
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        userId_conversationId: { userId, conversationId },
      },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    // Get sender info
    const sender = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatar: true },
    });

    // Create message
    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        type: dto.type || 'TEXT',
        senderId: userId,
        conversationId,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Update conversation updatedAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Mark as read for sender
    await this.markAsRead(conversationId, userId);

    // Send real-time notification via Pusher
    await this.pusher.sendMessageNotification(conversationId, {
      id: message.id,
      content: message.content,
      type: message.type,
      senderId: message.senderId,
      senderName: sender?.name || 'Unknown',
      senderAvatar: sender?.avatar || undefined,
      createdAt: message.createdAt,
    });

    // Notify other members
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true },
    });

    if (conversation) {
      for (const m of conversation.members) {
        if (m.userId !== userId) {
          await this.pusher.sendUserNotification(m.userId, 'new-message-notification', {
            conversationId,
            message: {
              id: message.id,
              content: message.content,
              senderName: sender?.name,
              senderAvatar: sender?.avatar,
            },
          });
        }
      }
    }

    return message;
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string, userId: string) {
    await this.prisma.conversationMember.update({
      where: {
        userId_conversationId: { userId, conversationId },
      },
      data: { lastReadAt: new Date() },
    });
    return { success: true };
  }

  /**
   * Get total unread message count for a user
   */
  async getUnreadCount(userId: string) {
    const members = await this.prisma.conversationMember.findMany({
      where: { userId },
    });

    let totalUnread = 0;
    for (const member of members) {
      const count = await this.prisma.message.count({
        where: {
          conversationId: member.conversationId,
          senderId: { not: userId },
          createdAt: member.lastReadAt ? { gt: member.lastReadAt } : undefined,
        },
      });
      totalUnread += count;
    }

    return { unreadCount: totalUnread };
  }

  /**
   * Update group conversation (name, avatar)
   */
  async updateGroupConversation(
    conversationId: string,
    userId: string,
    dto: UpdateGroupConversationDto,
  ) {
    // Get conversation and verify it's a group
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        type: 'GROUP',
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Group conversation not found');
    }

    // Check if user is a member of the group
    const member = conversation.members.find((m) => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }
    
    // Note: Temporarily allowing all members to update for testing
    // TODO: Re-enable strict permission check after testing
    // if (member?.role !== 'OWNER' && member?.role !== 'ADMIN') {
    //   throw new ForbiddenException('Only group owner or admin can update group settings');
    // }

    // Update conversation
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;

    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    // Notify all members about the update
    for (const m of updated.members) {
      await this.pusher.sendUserNotification(m.userId, 'conversation-updated', {
        conversationId,
        name: updated.name,
        avatar: updated.avatar,
      });
    }

    return this.formatConversation(updated, userId);
  }

  /**
   * Add members to group conversation
   */
  async addMembers(conversationId: string, userId: string, dto: AddMembersDto) {
    // Get conversation and verify it's a group
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        type: 'GROUP',
        members: { some: { userId } },
      },
      include: {
        members: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Group conversation not found');
    }

    // Check if user is a member of the group
    const member = conversation.members.find((m) => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Note: Temporarily allowing all members to add for testing
    // TODO: Re-enable strict permission check after testing
    // if (member?.role !== 'OWNER' && member?.role !== 'ADMIN') {
    //   throw new ForbiddenException('Only group owner or admin can add members');
    // }

    // Verify all new members exist
    const newMemberIds = dto.memberIds.filter(
      (id) => !conversation.members.some((m) => m.userId === id),
    );

    if (newMemberIds.length === 0) {
      throw new BadRequestException('All users are already members');
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: newMemberIds } },
    });

    if (users.length !== newMemberIds.length) {
      throw new BadRequestException('One or more users not found');
    }

    // Add new members
    await this.prisma.conversationMember.createMany({
      data: newMemberIds.map((id) => ({
        userId: id,
        conversationId,
        role: 'MEMBER',
      })),
    });

    // Get updated conversation
    const updated = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    // Notify new members about being added
    for (const newMemberId of newMemberIds) {
      await this.pusher.sendUserNotification(newMemberId, 'new-conversation', {
        conversationId,
        name: updated?.name,
        type: 'GROUP',
      });
    }

    // Notify existing members about new members
    for (const m of conversation.members) {
      await this.pusher.sendUserNotification(m.userId, 'members-added', {
        conversationId,
        newMemberIds,
      });
    }

    return this.formatConversation(updated, userId);
  }

  /**
   * Format conversation for response
   */
  private formatConversation(conversation: any, currentUserId: string) {
    const otherMembers = conversation.members.filter(
      (m: any) => m.userId !== currentUserId,
    );
    const currentMember = conversation.members.find(
      (m: any) => m.userId === currentUserId,
    );

    // For private chats, use the other user's info
    if (conversation.type === 'PRIVATE' && otherMembers.length === 1) {
      const otherUser = otherMembers[0].user;
      return {
        id: conversation.id,
        type: conversation.type,
        name: otherUser.name,
        avatar: otherUser.avatar,
        otherUser,
        members: conversation.members.map((m: any) => m.user),
        lastMessage: conversation.messages?.[0] || null,
        myRole: currentMember?.role,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };
    }

    // For group chats
    return {
      id: conversation.id,
      type: conversation.type,
      name: conversation.name,
      avatar: conversation.avatar,
      members: conversation.members.map((m: any) => ({
        ...m.user,
        role: m.role,
      })),
      lastMessage: conversation.messages?.[0] || null,
      myRole: currentMember?.role,
      ownerId: conversation.ownerId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}

