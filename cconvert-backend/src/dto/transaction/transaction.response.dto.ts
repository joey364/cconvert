export class TransactionResponse {
  public readonly id: string
  public readonly userId: string
  public readonly fromCurrency: string
  public readonly toCurrency: string
  public readonly amount: number
  public readonly convertedAmount: number
  public readonly timestamp: Date
}