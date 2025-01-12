import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { TransactionsService } from 'src/transactions/transactions.service';
import { User } from './user.decorator';

@Controller('user')
export class UsersController {
  constructor(
    private readonly transactionService: TransactionsService
  ) { }

  @UseGuards(AuthGuard)
  @Get('transactions')
  async getUserTransactions(@User() user) {
  return  await this.transactionService.getUserTransactionsByUserId(user.userId)
  }
}
