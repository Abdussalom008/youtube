import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { Request, Response } from 'express';
import { VideoService } from './videos.service';
import { UpdateVideoDto } from './dto/upload-video.dto';

@Controller('movie')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (req, file, callback) => {
          const mimeType = path.extname(file.originalname);
          const fileName = `${Date.now()}${mimeType}`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return await this.videoService.uploadVideo(file);
  }
  @Get('watch/video/:id')
  async watchVideo(
    @Param('id') id: string,
    @Query('quality') quality: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const param = id;
    const contentRange = req.headers.range;
    await this.videoService.watchVideo(
      param,
      quality,
      contentRange as string,
      res,
    );
  }
  
  @Get(':id/status')
  async getVideoStatus(@Param('id') id: string) {
    return await this.videoService.getVideoStatus(id);
  }

  @Put(':id')
  async updateVideo(
    @Param('id') id: string,
    @Body() dto: UpdateVideoDto,
  ) {
    return await this.videoService.updateVideo(id, dto);
  }

  @Delete(':id')
  async deleteVideo(@Param('id') id: string) {
    return await this.videoService.deleteVideo(id);
  }
}
