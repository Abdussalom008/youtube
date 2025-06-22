import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSubscriptionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;
}
