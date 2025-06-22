import { Module } from '@nestjs/common';
import { VideoController } from './videos.controller';
import { VideoService } from './videos.service';
import VideoConvertorService from './vodeo.convertor.service';

@Module({
  controllers: [VideoController],
  providers: [VideoService, VideoConvertorService],
})
export class VideosModule {}
