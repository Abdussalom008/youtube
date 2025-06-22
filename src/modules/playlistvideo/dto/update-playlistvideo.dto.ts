import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaylistvideoDto } from './create-playlistvideo.dto';

export class UpdatePlaylistvideoDto extends PartialType(CreatePlaylistvideoDto) {}
