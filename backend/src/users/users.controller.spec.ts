import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findOne: jest.fn(),
    getUserBlogs: jest.fn(),
  };

  const mockUser = {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'avatar.jpg',
    createdAt: new Date(),
  };

  const mockUserBlogs = {
    blogs: [
      {
        id: '1',
        title: 'Test Blog',
        slug: 'test-blog',
        excerpt: 'Test excerpt',
        published: true,
        createdAt: new Date(),
      },
    ],
    total: 1,
    pages: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user profile', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('user1');

      expect(service.findOne).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserBlogs', () => {
    it('should return user blogs with default pagination', async () => {
      mockUsersService.getUserBlogs.mockResolvedValue(mockUserBlogs);

      const result = await controller.getUserBlogs('user1');

      expect(service.getUserBlogs).toHaveBeenCalledWith('user1', 1, 10);
      expect(result).toEqual(mockUserBlogs);
    });

    it('should return user blogs with custom pagination', async () => {
      mockUsersService.getUserBlogs.mockResolvedValue(mockUserBlogs);

      const result = await controller.getUserBlogs('user1', '2', '5');

      expect(service.getUserBlogs).toHaveBeenCalledWith('user1', 2, 5);
      expect(result).toEqual(mockUserBlogs);
    });
  });
});