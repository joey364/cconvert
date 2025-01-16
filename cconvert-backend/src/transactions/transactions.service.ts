import { Injectable } from '@nestjs/common';
import PaginationDto from 'src/dto/PaginationDto';
import { TransactionResponse } from 'src/transactions/dto/transaction.response.dto';
import { PrismaService } from 'src/prisma.service';
import { Transaction } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}
  async getUserTransactionsByUserId(
    userId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({
        where: { userId },
      }),
    ]);

    return new PaginationDto<TransactionResponse>(
      page,
      limit,
      totalItems,
      this.mapToResponse(data),
    );
  }

  private mapToResponse(data: Transaction[]) {
    if (data.length === 0) return [];
    return data.map((item) => {
      const response = new TransactionResponse();
      response.id = item.id;
      response.amount = item.amount.toNumber();
      response.convertedAmount = item.convertedAmount.toNumber();
      response.fromCurrency = item.fromCurrency;
      response.toCurrency = item.toCurrency;
      response.timestamp = item.timestamp.getMilliseconds();
      response.userId = item.userId;

      return response;
    });
  }
}
