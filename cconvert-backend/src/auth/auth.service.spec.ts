import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginRequest, LoginResponse } from 'src/auth/auth.dto';
import { ConfigService } from '@nestjs/config';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('@nestjs/jwt');

const prisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        JwtService,
        ConfigService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a token if user exists and password is correct', async () => {
    // Arrange
    const loginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 16),
    };

    prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const mockToken = 'mockToken123';
    jwtService.sign = jest.fn().mockReturnValue(mockToken);

    // Act
    const result = await service.login(loginRequest);

    const loginResponse = new LoginResponse();
    loginResponse.token = mockToken;

    // Assert
    expect(result).toStrictEqual(loginResponse);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: loginRequest.email },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      loginRequest.password,
      mockUser.password,
    );
    expect(jwtService.sign).toHaveBeenCalledWith({
      userId: mockUser.id,
      email: mockUser.email,
    });
  });

  it('should create a new user and return a token if user does not exist', async () => {
    // Arrange
    const loginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    prisma.user.findUnique = jest.fn().mockResolvedValue(null);

    const hashedPassword = 'hashedPassword';
    (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue(hashedPassword);

    const createdUser = {
      id: 2,
      email: 'test@example.com',
      password: hashedPassword,
    };
    prisma.user.create = jest.fn().mockResolvedValue(createdUser);

    const mockToken = 'mockToken123';
    jwtService.sign = jest.fn().mockReturnValue(mockToken);

    const loginResponse = new LoginResponse();
    loginResponse.token = mockToken;

    // Act
    const result = await service.login(loginRequest);

    // Assert
    expect(result).toStrictEqual(loginResponse);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: loginRequest.email },
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { email: loginRequest.email, password: hashedPassword },
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      userId: createdUser.id,
      email: createdUser.email,
    });
  });
});
