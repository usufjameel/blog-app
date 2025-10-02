import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockCommentsService = {
    create: jest.fn(),
    findByBlog: jest.fn(),
    remove: jest.fn(),
  };

  const mockComment = {
    id: '1',
    content: 'Test comment',
    createdAt: new Date(),
    authorId: 'user1',
    blogId: 'blog1',
    author: {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    })
    .overrideGuard(require('../common/guards/firebase-auth.guard').FirebaseAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
        blogId: 'blog1',
      };
      const user = { id: 'user1' };

      mockCommentsService.create.mockResolvedValue(mockComment);

      const result = await controller.create(createCommentDto, user);

      expect(service.create).toHaveBeenCalledWith(createCommentDto, user.id);
      expect(result).toEqual(mockComment);
    });
  });

  describe('findByBlog', () => {
    it('should return comments for a blog', async () => {
      const mockComments = [mockComment];

      mockCommentsService.findByBlog.mockResolvedValue(mockComments);

      const result = await controller.findByBlog('blog1');

      expect(service.findByBlog).toHaveBeenCalledWith('blog1');
      expect(result).toEqual(mockComments);
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      const user = { id: 'user1' };
      const mockResponse = { message: 'Comment deleted successfully' };

      mockCommentsService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove('1', user);

      expect(service.remove).toHaveBeenCalledWith('1', user.id);
      expect(result).toEqual(mockResponse);
    });
  });
});