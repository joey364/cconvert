import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeService } from './exchange.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RatesResponse } from 'src/dto/exchange/rates.response.dto';
import axios from 'axios';
import { BadRequestException } from '@nestjs/common';
import { ConvertRequest } from 'src/dto/exchange/convert.request.dto';
import { ConvertResponse } from 'src/dto/exchange/convert.response.dto';

jest.mock('axios')
jest.mock('src/prisma.service');
jest.mock('@nestjs/config');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ExchangeService', () => {
  let service: ExchangeService;
  let prismaService: PrismaService
  let configService: ConfigService

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockPrismaService = {
    transaction: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService }
      ],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
    configService = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getExchangeRates', () => {
    it('should return the exchange rates', async () => {
      // Arrange
      const mockResponse = {
        data: {
          base: 'USD',
          rates: {
            EUR: 0.85,
            GBP: 0.75,
          },
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      mockConfigService.get.mockReturnValue('http://api.exchangeratesapi.io');

      // Act
      const result: RatesResponse = await service.getExchangeRates();

      // Assert
      expect(result.baseCurrency).toBe('USD');
      expect(result.rates).toEqual(mockResponse.data.rates);
    });

    it('should handle errors and throw a relevant exception', async () => {
      mockedAxios.get.mockRejectedValue(new BadRequestException());

      await expect(service.getExchangeRates()).rejects.toThrowError(BadRequestException);
    });
  });

  describe('convert', () => {
    it('should convert the amount and return the response', async () => {
      const request: ConvertRequest = {
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
      };

      const rates = { EUR: 0.85, USD: 1 };
      mockedAxios.get.mockResolvedValue({ data: { rates } });

      mockConfigService.get.mockReturnValue('http://api.exchangeratesapi.io');

      mockPrismaService.transaction.create.mockResolvedValue({
        ...request,
        userId: 'user-id',
        convertedAmount: 85,
      });

      const response: ConvertResponse = await service.convert(request, 'user-id');

      expect(response.amount).toBe(request.amount);
      expect(response.convertedValue).toBe(85);
      expect(response.fromCurrency).toBe('USD');
      expect(response.toCurrency).toBe('EUR');
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: { ...request, userId: 'user-id', convertedAmount: 85 },
      });
    });
  })
});
