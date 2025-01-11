import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}
  async getUserTransactionsByUserId(userId: string) {
    // TODO: paginate this
    return await this.prisma.transaction.findMany({ where: { userId } });
  }
}
