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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PostsService = class PostsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPostDto, authorId) {
        return this.prisma.post.create({
            data: {
                ...createPostDto,
                authorId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
    }
    async findAll(page = 1, limit = 10, published) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const where = published !== undefined ? { published } : {};
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip,
                take: limitNum,
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
                        select: { comments: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
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
    async findById(id) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
        if (!post) {
            throw new common_1.NotFoundException(`Post with ID ${id} not found`);
        }
        return post;
    }
    async findByAuthor(authorId, page = 1, limit = 10) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { authorId },
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
                },
            }),
            this.prisma.post.count({ where: { authorId } }),
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
    async update(id, updatePostDto, userId, userRole) {
        const post = await this.findById(id);
        if (post.authorId !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('You are not authorized to update this post');
        }
        return this.prisma.post.update({
            where: { id },
            data: updatePostDto,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
    }
    async remove(id, userId, userRole) {
        const post = await this.findById(id);
        if (post.authorId !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('You are not authorized to delete this post');
        }
        return this.prisma.post.delete({
            where: { id },
        });
    }
    async togglePublish(id, userId, userRole) {
        const post = await this.findById(id);
        if (post.authorId !== userId && userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('You are not authorized to modify this post');
        }
        return this.prisma.post.update({
            where: { id },
            data: { published: !post.published },
        });
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PostsService);
//# sourceMappingURL=posts.service.js.map