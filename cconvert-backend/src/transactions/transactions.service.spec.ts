import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

const mockPrismaService = {
  transaction: {
    findMany: jest.fn(),
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
      const mockTransactions = [
        { id: 1, amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' },
        { id: 2, amount: 200, fromCurrency: 'USD', toCurrency: 'GBP' },
      ];
      mockPrismaService.transaction.findMany.mockResolvedValue(
        mockTransactions,
      );

      const result = await service.getUserTransactionsByUserId(userId, 1, 10);

      expect(result).toEqual(mockTransactions);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: 0,
        take: 10,
      });
    });

    it('should handle pagination correctly', async () => {
      const userId = 'user-id';
      const mockTransactions = [
        { id: 1, amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' },
        { id: 2, amount: 200, fromCurrency: 'USD', toCurrency: 'GBP' },
      ];

      // Simulating pagination for page 2 (skip 2, take 2)
      mockPrismaService.transaction.findMany.mockResolvedValue(
        mockTransactions,
      );

      const result = await service.getUserTransactionsByUserId(userId, 2, 2);

      expect(result).toEqual(mockTransactions);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: 2,
        take: 2,
      });
    });

    it('should return an empty array if no transactions are found', async () => {
      const userId = 'user-id';
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      const result = await service.getUserTransactionsByUserId(userId, 1, 10);

      expect(result).toEqual([]);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: 0,
        take: 10,
      });
    });
  });
});
