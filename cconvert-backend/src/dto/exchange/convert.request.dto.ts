import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, Length, Min } from 'class-validator';

export class ConvertRequest {
  @Transform(({ value }) => value.trim())
  @Transform(({ value }) => value.replace(/\s+/g, ' '))
  @Length(3, 3)
  public readonly fromCurrency: string;

  @Transform(({ value }) => value.trim())
  @Transform(({ value }) => value.replace(/\s+/g, ' '))
  @Length(3, 3)
  public readonly toCurrency: string;

  @IsNumber()
  @Min(1)
  public readonly amount: number;
}
