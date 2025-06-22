import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import AuthGuard from 'src/common/guards/auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard)
  @Post('/videos/:videoId/comments')
  async addComment(
    @Param('videoId') videoId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.commentsService.addComment(videoId, userId, dto);
  }

  @Get('/videos/:videoId/comments')
  async getComments(
    @Param('videoId') videoId: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Query('sort') sort: string,
  ) {
    return this.commentsService.getComments(
      videoId,
      parseInt(page) || 1,
      parseInt(limit) || 20,
      sort || 'top',
    );
  }

  @Post('/comments/:id/like')
  @UseGuards(AuthGuard)
  like(@Param('id') id: string, @Req() req) {
    return this.commentsService.likeComment(id, req.user.id);
  }

  @Post('/comments/:id/dislike')
  @UseGuards(AuthGuard)
  dislike(@Param('id') id: string, @Req() req) {
    return this.commentsService.dislikeComment(id, req.user.id);
  }

  @Delete('/comments/:id/like')
  @UseGuards(AuthGuard)
  unlike(@Param('id') id: string, @Req() req) {
    return this.commentsService.removeLike(id, req.user.id);
  }
}
