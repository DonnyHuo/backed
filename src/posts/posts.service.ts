import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CoverService } from '../cover/cover.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coverService: CoverService,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: string) {
    // Use user-provided coverUrls or generate one automatically
    let coverUrls: string[] = createPostDto.coverUrls || [];

    // Only generate cover if user didn't provide any
    if (coverUrls.length === 0) {
      try {
        const generatedCover = await this.coverService.generateCover(createPostDto.title);
        if (generatedCover) {
          coverUrls = [generatedCover];
        }
      } catch (error) {
        console.error('Failed to generate cover image:', error);
        // Continue without cover if generation fails
      }
    }

    // Remove coverUrls from DTO to avoid duplicate assignment
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

  async findAll(page = 1, limit = 10, published?: boolean, userId?: string) {
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
          // Include user's like/favorite status if userId provided
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

    // Transform posts to include isLiked and isFavorited
    const transformedPosts = posts.map((post: any) => ({
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

  async findById(id: string, userId?: string) {
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
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return {
      ...post,
      isLiked: userId ? (post as any).likes?.length > 0 : false,
      isFavorited: userId ? (post as any).favorites?.length > 0 : false,
      likes: undefined,
      favorites: undefined,
    };
  }

  async findByAuthor(authorId: string, page = 1, limit = 10, userId?: string) {
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

    const transformedPosts = posts.map((post: any) => ({
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

  async update(id: string, updatePostDto: UpdatePostDto, userId: string, userRole: string) {
    const post = await this.findById(id);

    // Only the author or admin can update
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to update this post');
    }

    // Separate coverUrls from other update data
    const { coverUrls: userCoverUrls, ...restUpdateDto } = updatePostDto;
    const updateData: any = { ...restUpdateDto };

    // If user provided coverUrls, use them directly
    if (userCoverUrls !== undefined) {
      updateData.coverUrls = userCoverUrls;
    } else if (updatePostDto.title || updatePostDto.content !== undefined) {
      // Only auto-generate cover if title or content is being updated and no custom coverUrls provided
      const title = updatePostDto.title || post.title;

      try {
        const generatedCover = await this.coverService.generateCover(title);
        if (generatedCover) {
          updateData.coverUrls = [generatedCover];
        }
      } catch (error) {
        console.error('Failed to generate cover image:', error);
        // Continue without updating cover if generation fails
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

  async remove(id: string, userId: string, userRole: string) {
    const post = await this.findById(id);

    // Only the author or admin can delete
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to delete this post');
    }

    return this.prisma.post.delete({
      where: { id },
    });
  }

  async togglePublish(id: string, userId: string, userRole: string) {
    const post = await this.findById(id);

    // Only the author or admin can toggle publish status
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to modify this post');
    }

    return this.prisma.post.update({
      where: { id },
      data: { published: !post.published },
    });
  }

  // Toggle like on a post
  async toggleLike(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const existingLike = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    let liked: boolean;
    if (existingLike) {
      await this.prisma.like.delete({
        where: { id: existingLike.id },
      });
      liked = false;
    } else {
      await this.prisma.like.create({
        data: { userId, postId },
      });
      liked = true;
    }

    // Get updated count
    const likesCount = await this.prisma.like.count({
      where: { postId },
    });

    return { liked, likesCount, message: liked ? 'Post liked' : 'Like removed' };
  }

  // Toggle favorite on a post
  async toggleFavorite(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const existingFavorite = await this.prisma.favorite.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    let favorited: boolean;
    if (existingFavorite) {
      await this.prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      favorited = false;
    } else {
      await this.prisma.favorite.create({
        data: { userId, postId },
      });
      favorited = true;
    }

    // Get updated count
    const favoritesCount = await this.prisma.favorite.count({
      where: { postId },
    });

    return { favorited, favoritesCount, message: favorited ? 'Post favorited' : 'Favorite removed' };
  }

  // Get user's liked posts
  async getUserLikedPosts(userId: string, page = 1, limit = 10) {
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

  // Get user's favorited posts
  async getUserFavoritedPosts(userId: string, page = 1, limit = 10) {
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

  // Get user's commented posts
  async getUserCommentedPosts(userId: string, page = 1, limit = 10) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    // Get all comments by user with post information
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

    // Group by postId and keep the latest comment time for each post
    const postMap = new Map<string, any>();
    allComments.forEach((comment: any) => {
      const postId = comment.postId;
      const existing = postMap.get(postId);
      if (!existing || comment.createdAt > existing.commentedAt) {
        postMap.set(postId, {
          ...comment.post,
          commentedAt: comment.createdAt,
        });
      }
    });

    // Convert to array and sort by commentedAt (most recent first)
    const allPosts = Array.from(postMap.values()).sort(
      (a, b) => new Date(b.commentedAt).getTime() - new Date(a.commentedAt).getTime(),
    );

    // Paginate
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

  // Search posts by keyword (fuzzy search)
  async search(keyword: string, page = 1, limit = 10, userId?: string) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build search condition - search in title and content
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
      published: true, // Only search published posts
      OR: [
        {
          title: {
            contains: searchKeyword,
            mode: 'insensitive' as const, // Case-insensitive search
          },
        },
        {
          content: {
            contains: searchKeyword,
            mode: 'insensitive' as const,
          },
        },
        {
          author: {
            name: {
              contains: searchKeyword,
              mode: 'insensitive' as const,
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

    // Transform posts to include isLiked and isFavorited
    const transformedPosts = posts.map((post: any) => ({
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
}
