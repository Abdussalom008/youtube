import { Injectable, NotFoundException } from '@nestjs/common';
import PrismaService from 'src/core/database/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(private prismaService: PrismaService) {}

  async create(userId: string, dto: CreatePlaylistDto) {
    const playlist = await this.prismaService.prisma.playlist.create({
      data: {
        ...dto,
        authorId: userId,
      },
    });
    return { message: 'Playlist yaratildi', playlist };
  }

  async findOne(playlistId: string) {
    const playlist = await this.prismaService.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        videos: {
          include: {
            video: true,
          },
        },
      },
    });

    if (!playlist) throw new NotFoundException('Playlist topilmadi');
    return playlist;
  }

  async findUserPlaylists(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.prismaService.prisma.$transaction([
      this.prismaService.prisma.playlist.findMany({
        where: { authorId: userId },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.prismaService.prisma.playlist.count({ where: { authorId: userId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(playlistId: string, dto: UpdatePlaylistDto) {
    const playlist = await this.prismaService.prisma.playlist.update({
      where: { id: playlistId },
      data: dto,
    });
    return { message: 'Playlist yangilandi', playlist };
  }

  async delete(playlistId: string) {
    await this.prismaService.prisma.playlist.delete({
      where: { id: playlistId },
    });
    return { message: 'Playlist o‘chirildi' };
  }
}
