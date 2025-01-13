import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}
  async getUserTransactionsByUserId(
    userId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    return await this.prisma.transaction.findMany({
      where: { userId },
      skip,
      take: limit,
    });
  }
}
