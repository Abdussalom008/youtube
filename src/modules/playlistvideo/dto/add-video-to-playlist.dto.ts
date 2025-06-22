import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class AddVideoToPlaylistDto {
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @IsInt()
  @Min(0)
  position: number;
}
