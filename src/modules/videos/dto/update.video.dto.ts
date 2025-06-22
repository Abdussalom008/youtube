import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { Visibility } from '@prisma/client';

export class UpdateVideoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
