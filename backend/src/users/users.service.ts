import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            blogs: true,
            comments: true,
          },
        },
      },
    });
  }

  async getUserBlogs(id: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where: { authorId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          tags: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.blog.count({ where: { authorId: id } }),
    ]);

    return { blogs, total, pages: Math.ceil(total / limit) };
  }
}