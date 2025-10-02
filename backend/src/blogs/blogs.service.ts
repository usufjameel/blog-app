import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { createClient } from 'redis';

@Injectable()
export class BlogsService {
  private redis;

  constructor(private prisma: PrismaService) {
    this.redis = createClient({ url: process.env.REDIS_URL });
    this.redis.connect();
  }

  private generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async create(createBlogDto: CreateBlogDto, authorId: string) {
    const slug = this.generateSlug(createBlogDto.title);
    
    const blog = await this.prisma.blog.create({
      data: {
        ...createBlogDto,
        slug,
        authorId,
        tags: createBlogDto.tagIds ? {
          connect: createBlogDto.tagIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: true,
        tags: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    return blog;
  }

  async findAll(page = 1, limit = 10, category?: string, tag?: string, author?: string) {
    const skip = (page - 1) * limit;
    
    const where = {
      ...(author ? {} : { published: true }),
      ...(category && { category: { slug: category } }),
      ...(tag && { tags: { some: { slug: tag } } }),
      ...(author && { author: { email: author } }),
    };

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true, email: true, avatar: true } },
          category: true,
          tags: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.blog.count({ where }),
    ]);

    return { blogs, total, pages: Math.ceil(total / limit) };
  }

  async findPopular(limit = 10) {
    const cacheKey = `popular_blogs:${limit}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const blogs = await this.prisma.blog.findMany({
      where: { published: true },
      take: limit,
      orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: true,
        tags: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    await this.redis.setEx(cacheKey, 300, JSON.stringify(blogs));
    return blogs;
  }

  async findById(id: string, userId?: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
        category: true,
        tags: true,
        _count: { select: { likes: true, comments: true } },
        likes: userId ? { where: { userId } } : false,
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return {
      ...blog,
      isLiked: userId ? blog.likes.length > 0 : false,
    };
  }

  async findOne(slug: string, userId?: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: true,
        tags: true,
        _count: { select: { likes: true, comments: true } },
        likes: userId ? { where: { userId } } : false,
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // Increment view count
    const viewKey = `blog_view:${slug}:${userId || 'anonymous'}`;
    const hasViewed = await this.redis.get(viewKey);
    
    if (!hasViewed) {
      await Promise.all([
        this.prisma.blog.update({
          where: { id: blog.id },
          data: { views: { increment: 1 } },
        }),
        this.redis.setEx(viewKey, 86400, '1'), // 24 hours
      ]);
      blog.views += 1;
    }

    return {
      ...blog,
      isLiked: userId ? blog.likes.length > 0 : false,
    };
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, userId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.authorId !== userId) {
      throw new ForbiddenException('You can only update your own blogs');
    }

    const updatedBlog = await this.prisma.blog.update({
      where: { id },
      data: {
        ...updateBlogDto,
        slug: updateBlogDto.title ? this.generateSlug(updateBlogDto.title) : undefined,
        tags: updateBlogDto.tagIds ? {
          set: updateBlogDto.tagIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: true,
        tags: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    return updatedBlog;
  }

  async remove(id: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own blogs');
    }

    await this.prisma.blog.delete({ where: { id } });
    return { message: 'Blog deleted successfully' };
  }

  async toggleLike(blogId: string, userId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: { userId_blogId: { userId, blogId } },
    });

    if (existingLike) {
      await this.prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    } else {
      await this.prisma.like.create({
        data: { userId, blogId },
      });
      return { liked: true };
    }
  }
}