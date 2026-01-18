"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pusher_service_1 = require("../pusher/pusher.service");
let MessagesService = class MessagesService {
    constructor(prisma, pusher) {
        this.prisma = prisma;
        this.pusher = pusher;
    }
    async getOrCreatePrivateConversation(currentUserId, dto) {
        const { userId: otherUserId } = dto;
        if (currentUserId === otherUserId) {
            throw new common_1.BadRequestException('Cannot create conversation with yourself');
        }
        const otherUser = await this.prisma.user.findUnique({
            where: { id: otherUserId },
        });
        if (!otherUser) {
            throw new common_1.NotFoundException('User not found');
        }
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
    async createGroupConversation(currentUserId, dto) {
        const { name, avatar, memberIds } = dto;
        const allMemberIds = [...new Set([currentUserId, ...memberIds])];
        const users = await this.prisma.user.findMany({
            where: { id: { in: allMemberIds } },
        });
        if (users.length !== allMemberIds.length) {
            throw new common_1.BadRequestException('One or more users not found');
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
    async getConversations(userId) {
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
        const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => {
            const member = conv.members.find((m) => m.userId === userId);
            const unreadCount = await this.prisma.message.count({
                where: {
                    conversationId: conv.id,
                    senderId: { not: userId },
                    createdAt: member?.lastReadAt ? { gt: member.lastReadAt } : undefined,
                },
            });
            return { ...this.formatConversation(conv, userId), unreadCount };
        }));
        return conversationsWithUnread;
    }
    async getConversation(conversationId, userId) {
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
            throw new common_1.NotFoundException('Conversation not found');
        }
        return this.formatConversation(conversation, userId);
    }
    async getMessages(conversationId, userId, page = 1, limit = 50) {
        const member = await this.prisma.conversationMember.findUnique({
            where: {
                userId_conversationId: { userId, conversationId },
            },
        });
        if (!member) {
            throw new common_1.ForbiddenException('Not a member of this conversation');
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
            data: messages.reverse(),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async sendMessage(conversationId, userId, dto) {
        const member = await this.prisma.conversationMember.findUnique({
            where: {
                userId_conversationId: { userId, conversationId },
            },
        });
        if (!member) {
            throw new common_1.ForbiddenException('Not a member of this conversation');
        }
        const sender = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, avatar: true },
        });
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
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
        await this.markAsRead(conversationId, userId);
        await this.pusher.sendMessageNotification(conversationId, {
            id: message.id,
            content: message.content,
            type: message.type,
            senderId: message.senderId,
            senderName: sender?.name || 'Unknown',
            senderAvatar: sender?.avatar || undefined,
            createdAt: message.createdAt,
        });
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
    async markAsRead(conversationId, userId) {
        await this.prisma.conversationMember.update({
            where: {
                userId_conversationId: { userId, conversationId },
            },
            data: { lastReadAt: new Date() },
        });
        return { success: true };
    }
    async getUnreadCount(userId) {
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
    async updateGroupConversation(conversationId, userId, dto) {
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
            throw new common_1.NotFoundException('Group conversation not found');
        }
        const member = conversation.members.find((m) => m.userId === userId);
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.avatar !== undefined)
            updateData.avatar = dto.avatar;
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
        for (const m of updated.members) {
            await this.pusher.sendUserNotification(m.userId, 'conversation-updated', {
                conversationId,
                name: updated.name,
                avatar: updated.avatar,
            });
        }
        return this.formatConversation(updated, userId);
    }
    async addMembers(conversationId, userId, dto) {
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
            throw new common_1.NotFoundException('Group conversation not found');
        }
        const member = conversation.members.find((m) => m.userId === userId);
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        const newMemberIds = dto.memberIds.filter((id) => !conversation.members.some((m) => m.userId === id));
        if (newMemberIds.length === 0) {
            throw new common_1.BadRequestException('All users are already members');
        }
        const users = await this.prisma.user.findMany({
            where: { id: { in: newMemberIds } },
        });
        if (users.length !== newMemberIds.length) {
            throw new common_1.BadRequestException('One or more users not found');
        }
        await this.prisma.conversationMember.createMany({
            data: newMemberIds.map((id) => ({
                userId: id,
                conversationId,
                role: 'MEMBER',
            })),
        });
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
        for (const newMemberId of newMemberIds) {
            await this.pusher.sendUserNotification(newMemberId, 'new-conversation', {
                conversationId,
                name: updated?.name,
                type: 'GROUP',
            });
        }
        for (const m of conversation.members) {
            await this.pusher.sendUserNotification(m.userId, 'members-added', {
                conversationId,
                newMemberIds,
            });
        }
        return this.formatConversation(updated, userId);
    }
    async removeMember(conversationId, userId, dto) {
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
            throw new common_1.NotFoundException('Group conversation not found');
        }
        const member = conversation.members.find((m) => m.userId === userId);
        if (member?.role !== 'OWNER' && member?.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only group owner or admin can remove members');
        }
        const targetMember = conversation.members.find((m) => m.userId === dto.memberId);
        if (!targetMember) {
            throw new common_1.NotFoundException('Member not found in this group');
        }
        if (targetMember.role === 'OWNER') {
            throw new common_1.BadRequestException('Cannot remove group owner');
        }
        if (targetMember.userId === userId) {
            throw new common_1.BadRequestException('Cannot remove yourself. Use leave group instead.');
        }
        await this.prisma.conversationMember.delete({
            where: {
                userId_conversationId: {
                    userId: dto.memberId,
                    conversationId,
                },
            },
        });
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
        await this.pusher.sendUserNotification(dto.memberId, 'removed-from-group', {
            conversationId,
            name: updated?.name,
        });
        for (const m of conversation.members) {
            if (m.userId !== dto.memberId && m.userId !== userId) {
                await this.pusher.sendUserNotification(m.userId, 'member-removed', {
                    conversationId,
                    removedMemberId: dto.memberId,
                });
            }
        }
        return this.formatConversation(updated, userId);
    }
    async leaveGroup(conversationId, userId) {
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
            throw new common_1.NotFoundException('Group conversation not found');
        }
        const member = conversation.members.find((m) => m.userId === userId);
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        if (member.role === 'OWNER') {
            throw new common_1.BadRequestException('Group owner cannot leave. Please delete the group instead.');
        }
        await this.prisma.conversationMember.delete({
            where: {
                userId_conversationId: {
                    userId,
                    conversationId,
                },
            },
        });
        for (const m of conversation.members) {
            if (m.userId !== userId) {
                await this.pusher.sendUserNotification(m.userId, 'member-left', {
                    conversationId,
                    leftMemberId: userId,
                });
            }
        }
        return { success: true, message: 'Left group successfully' };
    }
    async deleteGroup(conversationId, userId) {
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
            throw new common_1.NotFoundException('Group conversation not found');
        }
        if (conversation.ownerId !== userId) {
            throw new common_1.ForbiddenException('Only group owner can delete the group');
        }
        const memberIds = conversation.members.map((m) => m.userId);
        await this.prisma.conversation.delete({
            where: { id: conversationId },
        });
        for (const memberId of memberIds) {
            if (memberId !== userId) {
                await this.pusher.sendUserNotification(memberId, 'group-deleted', {
                    conversationId,
                    name: conversation.name,
                });
            }
        }
        return { success: true, message: 'Group deleted successfully' };
    }
    formatConversation(conversation, currentUserId) {
        const otherMembers = conversation.members.filter((m) => m.userId !== currentUserId);
        const currentMember = conversation.members.find((m) => m.userId === currentUserId);
        if (conversation.type === 'PRIVATE' && otherMembers.length === 1) {
            const otherUser = otherMembers[0].user;
            return {
                id: conversation.id,
                type: conversation.type,
                name: otherUser.name,
                avatar: otherUser.avatar,
                otherUser,
                members: conversation.members.map((m) => m.user),
                lastMessage: conversation.messages?.[0] || null,
                myRole: currentMember?.role,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt,
            };
        }
        return {
            id: conversation.id,
            type: conversation.type,
            name: conversation.name,
            avatar: conversation.avatar,
            members: conversation.members.map((m) => ({
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
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pusher_service_1.PusherService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map