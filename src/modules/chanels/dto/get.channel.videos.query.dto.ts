import { IsOptional, IsIn, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetChannelVideosQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  limit?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsIn(['newest', 'oldest', 'popular'])
  sort?: 'newest' | 'oldest' | 'popular';
}
