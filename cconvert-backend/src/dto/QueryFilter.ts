import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class QueryFilter {
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit: number = 10;
}
