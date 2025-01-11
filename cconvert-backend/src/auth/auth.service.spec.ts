import { AuthService } from './auth.service';
import { PrismaService } from './../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginRequest } from './../dto/auth/auth.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('./../prisma.service');
jest.mock('@nestjs/jwt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService
  let jwtService: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService)

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a token if user exits and password is correct', async () => {
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


    // Assert
    expect(result).toBe(mockToken);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: loginRequest.email },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(loginRequest.password, mockUser.password);
    expect(jwtService.sign).toHaveBeenCalledWith({ userId: mockUser.id, email: mockUser.email });
  })

  it('should create a new user and return a token if user does not exist', async () => {
    // Arrange
    const loginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    prisma.user.findUnique = jest.fn().mockResolvedValue(null);

    (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue('hashedPassword');

    const createdUser = { id: 2, email: 'test@example.com', password: 'hashedPassword' };
    prisma.user.create = jest.fn().mockResolvedValue(createdUser);

    const mockToken = 'mockToken123';
    jwtService.sign = jest.fn().mockReturnValue(mockToken);

    // Act
    const result = await service.login(loginRequest);

    // Assert
    expect(result).toBe(mockToken);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: loginRequest.email },
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { email: loginRequest.email, password: 'hashedPassword' },
    });
    expect(jwtService.sign).toHaveBeenCalledWith({ userId: createdUser.id, email: createdUser.email });
  });

});
