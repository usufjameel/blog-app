import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    verifyToken: jest.fn(),
    findOrCreateUser: jest.fn(),
  };

  const mockUser = {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'avatar.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('verifyToken', () => {
  //   it('should verify a token', async () => {
  //     const token = 'valid-token';
  //     const mockResponse = { user: mockUser };

  //     mockAuthService.verifyToken.mockResolvedValue(mockUser);
  //     mockAuthService.findOrCreateUser.mockResolvedValue(mockUser);

  //     const result = await controller.verifyToken(token);

  //     expect(service.verifyToken).toHaveBeenCalledWith(token);
  //     expect(result).toEqual({ url: mockResponse });
  //   });
  // });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const user = { id: 'user1' };

      const result = await controller.getCurrentUser(user);

      expect(result).toEqual({ user });
    });
  });
});