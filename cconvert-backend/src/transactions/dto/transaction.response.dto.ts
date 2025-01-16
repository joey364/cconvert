export class TransactionResponse {
  id: number;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  timestamp: number;
}
