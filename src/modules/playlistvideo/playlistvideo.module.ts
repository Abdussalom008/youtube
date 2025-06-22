import { Module } from '@nestjs/common';
import { PlaylistvideoService } from './playlistvideo.service';
import { PlaylistvideoController } from './playlistvideo.controller';

@Module({
  controllers: [PlaylistvideoController],
  providers: [PlaylistvideoService],
})
export class PlaylistvideoModule {}
