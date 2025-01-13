import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersController } from './users.controller';
import { TransactionsService } from 'src/transactions/transactions.service';

@Module({
  imports: [],
  providers: [PrismaService, TransactionsService],
  controllers: [UsersController],
})
export class UsersModule {}
