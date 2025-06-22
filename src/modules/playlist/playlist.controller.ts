import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Put,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import AuthGuard from 'src/common/guards/auth.guard';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Req() req, @Body() dto: CreatePlaylistDto) {
    return this.playlistService.create(req.user.id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistService.findOne(id);
  }

  @Get('/user/:userId')
  findUserPlaylists(
    @Param('userId') userId: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ) {
    return this.playlistService.findUserPlaylists(
      userId,
      Number(page),
      Number(limit),
    );
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlaylistDto) {
    return this.playlistService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playlistService.delete(id);
  }
}
