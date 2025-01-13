import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { TransactionsService } from 'src/transactions/transactions.service';
import { User } from './user.decorator';

@Controller('user')
export class UsersController {
  constructor(private readonly transactionService: TransactionsService) {}

  @UseGuards(AuthGuard)
  @Get('transactions')
  async getUserTransactions(
    @User() user,
    @Query() page: number = 1,
    @Query() limit: number = 10,
  ) {
    return await this.transactionService.getUserTransactionsByUserId(
      user.userId,
      page,
      limit,
    );
  }
}
