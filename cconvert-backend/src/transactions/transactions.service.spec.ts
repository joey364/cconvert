import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import PaginationDto from 'src/dto/PaginationDto';
import { TransactionResponse } from './dto/transaction.response.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { Transaction } from '@prisma/client';

const mockPrismaService = {
  transaction: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        ConfigService,
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserTransactionsByUserId', () => {
    it('should return user transactions', async () => {
      const userId = 'user-id';
      const now = new Date();
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          amount: new Decimal(100),
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          convertedAmount: new Decimal(110),
          userId,
          timestamp: now,
        },
        {
          id: 2,
          amount: new Decimal(200),
          fromCurrency: 'USD',
          toCurrency: 'GBP',
          convertedAmount: new Decimal(115),
          userId,
          timestamp: now,
        },
      ];

      const mockTransactionsResponses: TransactionResponse[] = [
        {
          id: 1,
          amount: 100,
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          convertedAmount: 110,
          userId,
          timestamp: now.getMilliseconds(),
        },
        {
          id: 2,
          amount: 200,
          fromCurrency: 'USD',
          toCurrency: 'GBP',
          convertedAmount: 115,
          userId,
          timestamp: now.getMilliseconds(),
        },
      ];

      const paginationResponse = new PaginationDto<TransactionResponse>(
        1,
        10,
        2,
        mockTransactionsResponses,
      );

      mockPrismaService.transaction.findMany.mockResolvedValue(
        mockTransactions,
      );

      mockPrismaService.transaction.count.mockResolvedValue(
        mockTransactions.length,
      );

      const result = await service.getUserTransactionsByUserId(userId, 1, 10);

      expect(result.totalItems).toBe(paginationResponse.totalItems);
      expect(result.data.length).toBe(paginationResponse.data.length);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: 0,
        take: 10,
      });
    });

    it('should handle pagination correctly', async () => {
      const userId = 'user-id';
      const now = new Date();

      const mockTransactions: Transaction[] = [
        {
          id: 1,
          amount: new Decimal(100),
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          convertedAmount: new Decimal(110),
          userId,
          timestamp: now,
        },
        {
          id: 2,
          amount: new Decimal(200),
          fromCurrency: 'USD',
          toCurrency: 'GBP',
          convertedAmount: new Decimal(115),
          userId,
          timestamp: now,
        },
      ];

      const mockTransactionsResponses: TransactionResponse[] = [
        {
          id: 1,
          amount: 100,
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          convertedAmount: 110,
          userId,
          timestamp: now.getMilliseconds(),
        },
        {
          id: 2,
          amount: 200,
          fromCurrency: 'USD',
          toCurrency: 'GBP',
          convertedAmount: 115,
          userId,
          timestamp: now.getMilliseconds(),
        },
      ];

      const paginatedResponse = new PaginationDto<TransactionResponse>(
        2,
        2,
        2,
        mockTransactionsResponses,
      );

      // Simulating pagination for page 2 (skip 2, take 2)
      mockPrismaService.transaction.findMany.mockResolvedValue(
        mockTransactions,
      );

      mockPrismaService.transaction.count.mockResolvedValue(
        mockTransactions.length,
      );
      const result = await service.getUserTransactionsByUserId(userId, 2, 2);

      expect(result.totalItems).toEqual(paginatedResponse.totalItems);
      expect(result.data.length).toEqual(paginatedResponse.data.length);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: 2,
        take: 2,
      });
    });

    it('should return an empty array if no transactions are found', async () => {
      const userId = 'user-id';
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);
      const paginatedResponse = new PaginationDto<TransactionResponse>(
        1,
        10,
        0,
        [],
      );

      const result = await service.getUserTransactionsByUserId(userId, 1, 10);

      expect(result).toEqual(paginatedResponse);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: 0,
        take: 10,
      });
    });
  });
});
