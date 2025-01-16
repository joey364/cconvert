import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { LoginRequest, LoginResponse } from 'src/auth/auth.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: AuthService, useValue: mockAuthService },
        PrismaService,
        ConfigService,
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a token if login is successful', async () => {
      // Arrange
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockToken = 'mockToken123';

      authService.login = jest.fn().mockResolvedValue(mockToken);

      // Act
      const result = await controller.login(loginRequest);

      // Assert
      expect(result).toBe(mockToken);
      expect(authService.login).toHaveBeenCalledWith(loginRequest);
    });

    it('should throw an error if login fails due to invalid credentials', async () => {
      // Arrange
      const loginRequest: LoginRequest = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      authService.login = jest
        .fn()
        .mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      // Act & Assert
      try {
        await controller.login(loginRequest);
      } catch (error) {
        expect(error.message).toBe('Invalid credentials');
      }

      expect(authService.login).toHaveBeenCalledWith(loginRequest);
    });

    it('should handle invalid input (e.g., missing email or password)', async () => {
      // Arrange
      const loginRequest: LoginRequest = {
        email: '',
        password: 'password123',
      };

      // Act & Assert
      try {
        await controller.login(loginRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });
});
