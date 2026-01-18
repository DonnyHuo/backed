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
exports.FollowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FollowsService = class FollowsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async toggleFollow(followerId, followingId) {
        if (followerId === followingId) {
            throw new common_1.BadRequestException('You cannot follow yourself');
        }
        const targetUser = await this.prisma.user.findUnique({
            where: { id: followingId },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        if (existingFollow) {
            await this.prisma.follow.delete({
                where: { id: existingFollow.id },
            });
            return { followed: false, message: 'Unfollowed successfully' };
        }
        else {
            await this.prisma.follow.create({
                data: {
                    followerId,
                    followingId,
                },
            });
            return { followed: true, message: 'Followed successfully' };
        }
    }
    async isFollowing(followerId, followingId) {
        const follow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        return !!follow;
    }
    async getFollowers(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [followers, total] = await Promise.all([
            this.prisma.follow.findMany({
                where: { followingId: userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    follower: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            bio: true,
                        },
                    },
                },
            }),
            this.prisma.follow.count({
                where: { followingId: userId },
            }),
        ]);
        return {
            data: followers.map((f) => f.follower),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getFollowing(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [following, total] = await Promise.all([
            this.prisma.follow.findMany({
                where: { followerId: userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    following: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            bio: true,
                        },
                    },
                },
            }),
            this.prisma.follow.count({
                where: { followerId: userId },
            }),
        ]);
        return {
            data: following.map((f) => f.following),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getFollowCounts(userId) {
        const [followersCount, followingCount] = await Promise.all([
            this.prisma.follow.count({ where: { followingId: userId } }),
            this.prisma.follow.count({ where: { followerId: userId } }),
        ]);
        return {
            followers: followersCount,
            following: followingCount,
        };
    }
};
exports.FollowsService = FollowsService;
exports.FollowsService = FollowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FollowsService);
//# sourceMappingURL=follows.service.js.map