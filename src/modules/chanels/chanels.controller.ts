import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Query } from '@nestjs/common';
import { ChanelsService } from './chanels.service';
import { CreateChannelDto } from './dto/create-chanel.dto';
import AuthGuard from 'src/common/guards/auth.guard';
import { UpdateChannelDto } from './dto/update-chanel.dto';
import { GetChannelVideosQueryDto } from './dto/get.channel.videos.query.dto';

@Controller('chanels')
export class ChanelsController {
  constructor(private readonly channelService: ChanelsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateChannelDto, @Req() req) {
    const userId = req.user.id;
    return this.channelService.createChannel(dto, userId);
  }

  @Get(':username')
  async getChannel(@Param('username') username: string, @Req() req) {
    const userId = req.user?.id;
    const data = await this.channelService.getChannelDetails(username, userId);
    return { success: true, data };
  }

  @UseGuards(AuthGuard)
  @Put('me')
  updateMyChannel(@Body() dto: UpdateChannelDto, @Req() req) {
    const userId = req.user.id;
    return this.channelService.updateMyChannel(userId, dto);
  }

  @Get(':username/videos')
  getChannelVideos(
    @Param('username') username: string,
    @Query() query: GetChannelVideosQueryDto,
  ) {
    return this.channelService.getChannelVideos(username, query);
  }
}
