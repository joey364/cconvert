import { User } from '@prisma/client';
import { TransactionResponse } from '../transaction/transaction.response.dto';

export class UserResponse {
  id: string;
  email: string;
  transactions: TransactionResponse[];

  static fromUser(user: User): UserResponse {
    if (user == null) return null;
    const response = new UserResponse();
    response.id = user.id;
    response.email = user.email;
    return response;
  }
}
