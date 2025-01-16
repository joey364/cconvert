import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { TransactionsService } from 'src/transactions/transactions.service';
import { User } from './user.decorator';
import IUser from './IUser';
import { QueryFilter } from 'src/dto/QueryFilter';

@Controller('user')
export class UsersController {
  constructor(private readonly transactionService: TransactionsService) {}

  @UseGuards(AuthGuard)
  @Get('transactions')
  async getUserTransactions(@User() user: IUser, @Query() filter: QueryFilter) {
    return await this.transactionService.getUserTransactionsByUserId(
      user.userId,
      filter.page,
      filter.limit,
    );
  }
}
