import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import PrismaService from 'src/core/database/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prismaService: PrismaService) {}

  async addComment(videoId: string, userId: string, dto: CreateCommentDto) {
    const video = await this.prismaService.prisma.video.findUnique({
      where: { id: videoId },
    });
    if (!video) throw new NotFoundException('Video topilmadi');

    if (dto.parentId) {
      const parent = await this.prismaService.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent || parent.videoId !== videoId) {
        throw new BadRequestException('Notogri parentId');
      }
    }

    const comment = await this.prismaService.prisma.comment.create({
      data: {
        content: dto.content,
        videoId,
        authorId: userId,
        parentId: dto.parentId ?? null,
      },
    });

    return { message: 'Kommentariya qo‘shildi', comment };
  }

  async getComments(videoId: string, page = 1, limit = 20, sort = 'top') {
    const skip = (page - 1) * limit;

    const orderBy: Prisma.CommentOrderByWithRelationInput =
      sort === 'newest'
        ? { createdAt: Prisma.SortOrder.desc }
        : { likesCount: Prisma.SortOrder.desc };

    const [comments, total] = await this.prismaService.prisma.$transaction([
      this.prismaService.prisma.comment.findMany({
        where: {
          videoId,
          parentId: null,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          _count: {
            select: { replies: true },
          },
          replies: {
            take: 2,
            orderBy: { createdAt: Prisma.SortOrder.asc },
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy,
        take: limit,
        skip,
      }),
      this.prismaService.prisma.comment.count({
        where: {
          videoId,
          parentId: null,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        comments: comments.map((c) => ({
          id: c.id,
          content: c.content,
          likesCount: c.likesCount,
          dislikesCount: c.dislikeCount,
          isPinned: false,
          createdAt: c.createdAt,
          author: c.author,
          repliesCount: c._count.replies,
          replies: c.replies.map((r) => ({
            id: r.id,
            content: r.content,
            likesCount: r.likesCount,
            createdAt: r.createdAt,
            author: r.author,
          })),
        })),
        totalComments: total,
        hasMore: total > page * limit,
      },
    };
  }

  async likeComment(commentId: string, userId: string) {
    const comment = await this.prismaService.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Kommentariya topilmadi');

    const existingLike = await this.prismaService.prisma.like.findFirst({
      where: {
        commentId,
        userId,
        type: 'LIKE',
      },
    });

    if (existingLike) {
      throw new BadRequestException('Siz bu kommentga allaqachon like bosgansiz');
    }

    await this.prismaService.prisma.like.create({
      data: {
        commentId,
        userId,
        type: 'LIKE',
      },
    });

    await this.prismaService.prisma.comment.update({
      where: { id: commentId },
      data: {
        likesCount: { increment: 1 },
      },
    });

    return { message: 'Like bosildi' };
  }

  async dislikeComment(commentId: string, userId: string) {
    const comment = await this.prismaService.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Kommentariya topilmadi');

    const existingDislike = await this.prismaService.prisma.like.findFirst({
      where: {
        commentId,
        userId,
        type: 'DISLIKE',
      },
    });

    if (existingDislike) {
      throw new BadRequestException('Siz bu kommentga allaqachon dislike bosgansiz');
    }

    await this.prismaService.prisma.like.create({
      data: {
        commentId,
        userId,
        type: 'DISLIKE',
      },
    });

    await this.prismaService.prisma.comment.update({
      where: { id: commentId },
      data: {
        dislikeCount: { increment: 1 },
      },
    });

    return { message: 'Dislike bosildi' };
  }

  async removeLike(commentId: string, userId: string) {
    const like = await this.prismaService.prisma.like.findFirst({
      where: {
        commentId,
        userId,
        type: 'LIKE',
      },
    });

    if (!like) {
      throw new NotFoundException('Like topilmadi');
    }

    await this.prismaService.prisma.like.delete({
      where: {
        id: like.id,
      },
    });

    await this.prismaService.prisma.comment.update({
      where: { id: commentId },
      data: {
        likesCount: { decrement: 1 },
      },
    });

    return { message: 'Like ochirildi' };
  }
}
