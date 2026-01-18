import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
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

  async findById(id: string) {
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findById(id); // Check if user exists

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

  async remove(id: string) {
    await this.findById(id); // Check if user exists

    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Get public user profile (for viewing other users' pages)
   */
  async getPublicProfile(userId: string, currentUserId?: string) {
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
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if current user is following this user
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

  /**
   * Get user's posts (published only for other users, all for self)
   */
  async getUserPosts(userId: string, currentUserId?: string, page = 1, limit = 10) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // If viewing own posts, show all; otherwise only published
    const where =
      currentUserId === userId
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

  /**
   * Get statistics for the current user (likes and favorites received)
   */
  async getMyStats(userId: string) {
    // Get total likes received on user's posts
    const likesReceived = await this.prisma.like.count({
      where: {
        post: {
          authorId: userId,
        },
      },
    });

    // Get total favorites received on user's posts
    const favoritesReceived = await this.prisma.favorite.count({
      where: {
        post: {
          authorId: userId,
        },
      },
    });

    // Get total posts count
    const postsCount = await this.prisma.post.count({
      where: { authorId: userId },
    });

    // Get followers and following count
    const [followersCount, followingCount] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);

    // Get total comments received
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
}
