import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Visibility } from '@prisma/client';

export class CreatePlaylistDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(Visibility)
  visibility: Visibility;
}
