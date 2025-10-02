import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, authorId: string) {
    const comment = await this.prisma.comment.create({
      data: {
        ...createCommentDto,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    return comment;
  }

  async findByBlog(blogId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { blogId, parentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    return comments;
  }

  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Comment deleted successfully' };
  }
}