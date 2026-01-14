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
const cover_service_1 = require("../cover/cover.service");
let PostsService = class PostsService {
    constructor(prisma, coverService) {
        this.prisma = prisma;
        this.coverService = coverService;
    }
    async create(createPostDto, authorId) {
        let coverUrls = createPostDto.coverUrls || [];
        if (coverUrls.length === 0) {
            try {
                const generatedCover = await this.coverService.generateCover(createPostDto.title);
                if (generatedCover) {
                    coverUrls = [generatedCover];
                }
            }
            catch (error) {
                console.error('Failed to generate cover image:', error);
            }
        }
        const { coverUrls: _, ...postData } = createPostDto;
        return this.prisma.post.create({
            data: {
                ...postData,
                authorId,
                coverUrls,
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
    async findAll(page = 1, limit = 10, published, userId) {
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
                        select: { comments: true, likes: true, favorites: true },
                    },
                    ...(userId && {
                        likes: {
                            where: { userId },
                            select: { id: true },
                        },
                        favorites: {
                            where: { userId },
                            select: { id: true },
                        },
                    }),
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.post.count({ where }),
        ]);
        const transformedPosts = posts.map((post) => ({
            ...post,
            isLiked: userId ? post.likes?.length > 0 : false,
            isFavorited: userId ? post.favorites?.length > 0 : false,
            likes: undefined,
            favorites: undefined,
        }));
        return {
            data: transformedPosts,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        };
    }
    async findById(id, userId) {
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
                _count: {
                    select: { comments: true, likes: true, favorites: true },
                },
                ...(userId && {
                    likes: {
                        where: { userId },
                        select: { id: true },
                    },
                    favorites: {
                        where: { userId },
                        select: { id: true },
                    },
                }),
            },
        });
        if (!post) {
            throw new common_1.NotFoundException(`Post with ID ${id} not found`);
        }
        return {
            ...post,
            isLiked: userId ? post.likes?.length > 0 : false,
            isFavorited: userId ? post.favorites?.length > 0 : false,
            likes: undefined,
            favorites: undefined,
        };
    }
    async findByAuthor(authorId, page = 1, limit = 10, userId) {
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
                    _count: {
                        select: { comments: true, likes: true, favorites: true },
                    },
                    ...(userId && {
                        likes: {
                            where: { userId },
                            select: { id: true },
                        },
                        favorites: {
                            where: { userId },
                            select: { id: true },
                        },
                    }),
                },
            }),
            this.prisma.post.count({ where: { authorId } }),
        ]);
        const transformedPosts = posts.map((post) => ({
            ...post,
            isLiked: userId ? post.likes?.length > 0 : false,
            isFavorited: userId ? post.favorites?.length > 0 : false,
            likes: undefined,
            favorites: undefined,
        }));
        return {
            data: transformedPosts,
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
        const { coverUrls: userCoverUrls, ...restUpdateDto } = updatePostDto;
        const updateData = { ...restUpdateDto };
        if (userCoverUrls !== undefined) {
            updateData.coverUrls = userCoverUrls;
        }
        else if (updatePostDto.title || updatePostDto.content !== undefined) {
            const title = updatePostDto.title || post.title;
            try {
                const generatedCover = await this.coverService.generateCover(title);
                if (generatedCover) {
                    updateData.coverUrls = [generatedCover];
                }
            }
            catch (error) {
                console.error('Failed to generate cover image:', error);
            }
        }
        return this.prisma.post.update({
            where: { id },
            data: updateData,
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
    async toggleLike(postId, userId) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            throw new common_1.NotFoundException(`Post with ID ${postId} not found`);
        }
        const existingLike = await this.prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });
        if (existingLike) {
            await this.prisma.like.delete({
                where: { id: existingLike.id },
            });
            return { liked: false, message: 'Like removed' };
        }
        else {
            await this.prisma.like.create({
                data: { userId, postId },
            });
            return { liked: true, message: 'Post liked' };
        }
    }
    async toggleFavorite(postId, userId) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            throw new common_1.NotFoundException(`Post with ID ${postId} not found`);
        }
        const existingFavorite = await this.prisma.favorite.findUnique({
            where: { userId_postId: { userId, postId } },
        });
        if (existingFavorite) {
            await this.prisma.favorite.delete({
                where: { id: existingFavorite.id },
            });
            return { favorited: false, message: 'Favorite removed' };
        }
        else {
            await this.prisma.favorite.create({
                data: { userId, postId },
            });
            return { favorited: true, message: 'Post favorited' };
        }
    }
    async getUserLikedPosts(userId, page = 1, limit = 10) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const [likes, total] = await Promise.all([
            this.prisma.like.findMany({
                where: { userId },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    post: {
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
                    },
                },
            }),
            this.prisma.like.count({ where: { userId } }),
        ]);
        const posts = likes.map((like) => ({
            ...like.post,
            isLiked: true,
            likedAt: like.createdAt,
        }));
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
    async getUserFavoritedPosts(userId, page = 1, limit = 10) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const [favorites, total] = await Promise.all([
            this.prisma.favorite.findMany({
                where: { userId },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    post: {
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
                    },
                },
            }),
            this.prisma.favorite.count({ where: { userId } }),
        ]);
        const posts = favorites.map((fav) => ({
            ...fav.post,
            isFavorited: true,
            favoritedAt: fav.createdAt,
        }));
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
    async getUserCommentedPosts(userId, page = 1, limit = 10) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const allComments = await this.prisma.comment.findMany({
            where: { authorId: userId },
            include: {
                post: {
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
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const postMap = new Map();
        allComments.forEach((comment) => {
            const postId = comment.postId;
            const existing = postMap.get(postId);
            if (!existing || comment.createdAt > existing.commentedAt) {
                postMap.set(postId, {
                    ...comment.post,
                    commentedAt: comment.createdAt,
                });
            }
        });
        const allPosts = Array.from(postMap.values()).sort((a, b) => new Date(b.commentedAt).getTime() - new Date(a.commentedAt).getTime());
        const total = allPosts.length;
        const skip = (pageNum - 1) * limitNum;
        const posts = allPosts.slice(skip, skip + limitNum);
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
    async search(keyword, page = 1, limit = 10, userId) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const searchKeyword = keyword.trim();
        if (!searchKeyword) {
            return {
                data: [],
                meta: {
                    total: 0,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: 0,
                },
            };
        }
        const where = {
            published: true,
            OR: [
                {
                    title: {
                        contains: searchKeyword,
                        mode: 'insensitive',
                    },
                },
                {
                    content: {
                        contains: searchKeyword,
                        mode: 'insensitive',
                    },
                },
                {
                    author: {
                        name: {
                            contains: searchKeyword,
                            mode: 'insensitive',
                        },
                    },
                },
            ],
        };
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
                        select: { comments: true, likes: true, favorites: true },
                    },
                    ...(userId && {
                        likes: {
                            where: { userId },
                            select: { id: true },
                        },
                        favorites: {
                            where: { userId },
                            select: { id: true },
                        },
                    }),
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.post.count({ where }),
        ]);
        const transformedPosts = posts.map((post) => ({
            ...post,
            isLiked: userId ? post.likes?.length > 0 : false,
            isFavorited: userId ? post.favorites?.length > 0 : false,
            likes: undefined,
            favorites: undefined,
        }));
        return {
            data: transformedPosts,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        };
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cover_service_1.CoverService])
], PostsService);
//# sourceMappingURL=posts.service.js.map