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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        return this.prisma.user.create({
            data: createUserDto,
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                bio: true,
                backgroundImage: true,
                role: true,
                createdAt: true,
            },
        });
    }
    async findAll(page = 1, limit = 10) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limitNum,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                    bio: true,
                    backgroundImage: true,
                    role: true,
                    createdAt: true,
                    _count: {
                        select: { posts: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);
        return {
            data: users,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        };
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                posts: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                avatar: true,
                bio: true,
                backgroundImage: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async update(id, updateUserDto) {
        await this.findById(id);
        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                bio: true,
                backgroundImage: true,
                role: true,
                updatedAt: true,
            },
        });
    }
    async remove(id) {
        await this.findById(id);
        return this.prisma.user.delete({
            where: { id },
        });
    }
    async getPublicProfile(userId, currentUserId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                bio: true,
                backgroundImage: true,
                walletAddress: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        let isFollowing = false;
        if (currentUserId && currentUserId !== userId) {
            const follow = await this.prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: userId,
                    },
                },
            });
            isFollowing = !!follow;
        }
        return {
            ...user,
            isFollowing,
            postsCount: user._count.posts,
            followersCount: user._count.followers,
            followingCount: user._count.following,
            _count: undefined,
        };
    }
    async getUserPosts(userId, currentUserId, page = 1, limit = 10) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const where = currentUserId === userId
            ? { authorId: userId }
            : { authorId: userId, published: true };
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                    _count: {
                        select: { comments: true, likes: true, favorites: true },
                    },
                },
            }),
            this.prisma.post.count({ where }),
        ]);
        return {
            data: posts,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        };
    }
    async getMyStats(userId) {
        const likesReceived = await this.prisma.like.count({
            where: {
                post: {
                    authorId: userId,
                },
            },
        });
        const favoritesReceived = await this.prisma.favorite.count({
            where: {
                post: {
                    authorId: userId,
                },
            },
        });
        const postsCount = await this.prisma.post.count({
            where: { authorId: userId },
        });
        const [followersCount, followingCount] = await Promise.all([
            this.prisma.follow.count({ where: { followingId: userId } }),
            this.prisma.follow.count({ where: { followerId: userId } }),
        ]);
        const commentsReceived = await this.prisma.comment.count({
            where: {
                post: {
                    authorId: userId,
                },
            },
        });
        return {
            likesReceived,
            favoritesReceived,
            postsCount,
            followersCount,
            followingCount,
            commentsReceived,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map