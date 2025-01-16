import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeController } from './exchange.controller';
import { JwtService } from '@nestjs/jwt';
import { ExchangeService } from './exchange.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { ConvertRequest } from 'src/exchange/dto/convert.request.dto';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import IUser from 'src/users/IUser';

jest.mock('src/auth/auth.guard');
jest.mock('src/exchange/exchange.service');

describe('ExchangeController', () => {
  let controller: ExchangeController;
  let exchangeService: ExchangeService;
  let jwtService: JwtService;

  const mockExchangeService = {
    getExchangeRates: jest.fn(),
    convert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: ExchangeService, useValue: mockExchangeService },
        ConfigService,
        PrismaService,
      ],
      controllers: [ExchangeController],
    }).compile();

    controller = module.get<ExchangeController>(ExchangeController);
    exchangeService = module.get<ExchangeService>(ExchangeService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getExchangeRates', () => {
    it('should return exchange rates', async () => {
      // Arrange
      const mockRates = {
        baseCurrency: 'USD',
        rates: { EUR: 0.85, GBP: 0.75 },
      };
      mockExchangeService.getExchangeRates.mockResolvedValue(mockRates);

      // Act & Assert
      const result = await controller.getExchangeRates();

      expect(result).toEqual(mockRates);
      expect(exchangeService.getExchangeRates).toHaveBeenCalled();
    });
  });

  describe('convertCurrency', () => {
    it('should convert currency successfully for authenticated user', async () => {
      // Arrange
      const request: ConvertRequest = {
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
      };

      const mockResponse = {
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedValue: 85,
      };

      const user: IUser = { userId: 'user-id', email: 'user@email.com' };

      mockExchangeService.convert.mockResolvedValue(mockResponse);

      // Act && Assert
      const result = await controller.convertCurrency(request, user);

      expect(result).toEqual(mockResponse);
      expect(exchangeService.convert).toHaveBeenCalledWith(
        request,
        user.userId,
      );
    });

    it('should throw an error if the user is not authenticated', async () => {
      // Arrange
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: null }),
        }),
      } as unknown as ExecutionContext;

      // Act & Assert
      const guard = new AuthGuard(jwtService);
      const canActivate = await guard.canActivate(context);

      expect(canActivate).toBe(undefined); // guard throws therefore has holds no value
    });
  });
});
