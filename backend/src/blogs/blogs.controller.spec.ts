import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

describe('BlogsController', () => {
  let controller: BlogsController;
  let service: BlogsService;

  const mockBlogsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findPopular: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleLike: jest.fn(),
  };

  const mockBlog = {
    id: '1',
    title: 'Test Blog',
    slug: 'test-blog',
    content: 'Test content',
    excerpt: 'Test excerpt',
    published: true,
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'user1',
    author: {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
    },
    _count: {
      likes: 0,
      comments: 0,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: mockBlogsService,
        },
      ],
    })
    .overrideGuard(require('../common/guards/firebase-auth.guard').FirebaseAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<BlogsController>(BlogsController);
    service = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a blog', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'Test content',
        excerpt: 'Test excerpt',
        published: true,
      };
      const user = { id: 'user1' };

      mockBlogsService.create.mockResolvedValue(mockBlog);

      const result = await controller.create(createBlogDto, user);

      expect(service.create).toHaveBeenCalledWith(createBlogDto, user.id);
      expect(result).toEqual(mockBlog);
    });
  });

  describe('findAll', () => {
    it('should return paginated blogs', async () => {
      const mockResponse = {
        blogs: [mockBlog],
        total: 1,
        pages: 1,
      };

      mockBlogsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('1', '10');

      expect(service.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined, undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findPopular', () => {
    it('should return popular blogs', async () => {
      const mockPopularBlogs = [mockBlog];

      mockBlogsService.findPopular.mockResolvedValue(mockPopularBlogs);

      const result = await controller.findPopular('5');

      expect(service.findPopular).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockPopularBlogs);
    });
  });

  describe('findById', () => {
    it('should return a blog by ID', async () => {
      mockBlogsService.findById.mockResolvedValue(mockBlog);

      const result = await controller.findById('1');

      expect(service.findById).toHaveBeenCalledWith('1', undefined);
      expect(result).toEqual(mockBlog);
    });
  });

  describe('findOne', () => {
    it('should return a blog by slug', async () => {
      mockBlogsService.findOne.mockResolvedValue(mockBlog);

      const result = await controller.findOne('test-blog');

      expect(service.findOne).toHaveBeenCalledWith('test-blog', undefined);
      expect(result).toEqual(mockBlog);
    });
  });

  describe('update', () => {
    it('should update a blog', async () => {
      const updateBlogDto: UpdateBlogDto = {
        title: 'Updated Blog',
        content: 'Updated content',
      };
      const user = { id: 'user1' };
      const updatedBlog = { ...mockBlog, ...updateBlogDto };

      mockBlogsService.update.mockResolvedValue(updatedBlog);

      const result = await controller.update('1', updateBlogDto, user);

      expect(service.update).toHaveBeenCalledWith('1', updateBlogDto, user.id);
      expect(result).toEqual(updatedBlog);
    });
  });

  describe('remove', () => {
    it('should delete a blog', async () => {
      const user = { id: 'user1' };
      const mockResponse = { message: 'Blog deleted successfully' };

      mockBlogsService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove('1', user);

      expect(service.remove).toHaveBeenCalledWith('1', user.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('toggleLike', () => {
    it('should toggle like on a blog', async () => {
      const user = { id: 'user1' };
      const mockResponse = { liked: true };

      mockBlogsService.toggleLike.mockResolvedValue(mockResponse);

      const result = await controller.toggleLike('1', user);

      expect(service.toggleLike).toHaveBeenCalledWith('1', user.id);
      expect(result).toEqual(mockResponse);
    });
  });
});