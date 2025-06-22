import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PrismaService from 'src/core/database/prisma.service';
import { AddVideoToPlaylistDto } from './dto/add-video-to-playlist.dto';

@Injectable()
export class PlaylistVideoService {
  constructor(private prisma: PrismaService) {}

  async addVideoToPlaylist(
    playlistId: string,
    userId: string,
    dto: AddVideoToPlaylistDto,
  ) {
    const playlist = await this.prisma.prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) throw new NotFoundException('Playlist topilmadi');
    if (playlist.authorId !== userId)
      throw new BadRequestException(
        'Faqat o‘zingizning playlistga video qo‘sha olasiz',
      );

    const existing = await this.prisma.prisma.playlistVideo.findUnique({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId: dto.videoId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Bu video allaqachon playlistda mavjud');
    }

    return this.prisma.prisma.playlistVideo.create({
      data: {
        playlistId,
        videoId: dto.videoId,
        position: dto.position,
      },
    });
  }

  async removeVideoFromPlaylist(
    playlistId: string,
    videoId: string,
    userId: string,
  ) {
    const playlist = await this.prisma.prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) throw new NotFoundException('Playlist topilmadi');
    if (playlist.authorId !== userId)
      throw new BadRequestException(
        'Faqat o‘zingizning playlistdan video o‘chira olasiz',
      );

    const pv = await this.prisma.prisma.playlistVideo.findUnique({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId,
        },
      },
    });

    if (!pv) throw new NotFoundException('Video playlistda topilmadi');

    return this.prisma.prisma.playlistVideo.delete({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId,
        },
      },
    });
  }
}
