import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, authorId: string) {
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

  async findAll(page = 1, limit = 10, published?: boolean) {
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

  async findById(id: string) {
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
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async findByAuthor(authorId: string, page = 1, limit = 10) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
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

  async update(id: string, updatePostDto: UpdatePostDto, userId: string, userRole: string) {
    const post = await this.findById(id);

    // Only the author or admin can update
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to update this post');
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
}

