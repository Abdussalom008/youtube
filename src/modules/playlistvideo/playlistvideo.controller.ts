import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddVideoToPlaylistDto } from './dto/add-video-to-playlist.dto';
import AuthGuard from 'src/common/guards/auth.guard';
import { PlaylistVideoService } from './playlistvideo.service';

@Controller('playlists')
export class PlaylistVideoController {
  constructor(private readonly service: PlaylistVideoService) {}

  @UseGuards(AuthGuard)
  @Post(':id/videos')
  addVideo(
    @Param('id') playlistId: string,
    @Req() req,
    @Body() dto: AddVideoToPlaylistDto,
  ) {
    return this.service.addVideoToPlaylist(playlistId, req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id/videos/:videoId')
  removeVideo(
    @Param('id') playlistId: string,
    @Param('videoId') videoId: string,
    @Req() req,
  ) {
    return this.service.removeVideoFromPlaylist(
      playlistId,
      videoId,
      req.user.id,
    );
  }
}
