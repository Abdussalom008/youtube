import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import PrismaService from 'src/core/database/prisma.service';
import { CreateChannelDto } from './dto/create-chanel.dto';
import { Role } from '@prisma/client';
import { UpdateChannelDto } from './dto/update-chanel.dto';
import { GetChannelVideosQueryDto } from './dto/get.channel.videos.query.dto';

@Injectable()
export class ChanelsService {
  constructor(private prismaService: PrismaService){}
  async createChannel(createChannelDto: CreateChannelDto, ownerId: string) {
    const existing = await this.prismaService.prisma.channel.findUnique({
      where: { username: createChannelDto.username },
    });

    if (existing) {
      throw new BadRequestException('Username already taken');
    }

    return this.prismaService.prisma.channel.create({
      data: {
        ...createChannelDto,
        ownerId,
      },
    });
  }

  async getChannelDetails(username: string, currentUserId?: string) {
    const channel = await this.prismaService.prisma.channel.findUnique({
      where: { username },
      include: {
        owner: true,
      },
    });
  
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
  
    const videosCount = await this.prismaService.prisma.video.count({
      where: { authorId: channel.ownerId },
    });
  
    let isSubscribed = false;
    if (currentUserId) {
      const subscription = await this.prismaService.prisma.subscription.findFirst({
        where: {
          subscriberId: currentUserId,
          channelId: channel.ownerId,
        },
      });
      isSubscribed = !!subscription;
    }
  
    return {
      id: channel.owner.id,
      username: channel.owner.username,
      channelName: channel.name,
      channelDescription: channel.description,
      avatar: channel.owner.avatar ?? null,
      channelBanner: channel.banner ?? null,
      subscribersCount: channel.subscribersCount,
      totalViews: Number(channel.totalViews),
      videosCount,
      joinedAt: channel.createdAt,
      isVerified: channel.owner.role === Role.USER,
      isSubscribed,
    };
  }

  async updateMyChannel(userId: string, dto: UpdateChannelDto) {
    const channel = await this.prismaService.prisma.channel.findUnique({
      where: { ownerId: userId },
    });
  
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
  
    return this.prismaService.prisma.channel.update({
      where: { id: channel.id },
      data: {
        name: dto.channelName ?? channel.name,
        description: dto.channelDescription ?? channel.description,
        banner: dto.channelBanner ?? channel.banner,
      },
    });
  }

  async getChannelVideos(username: string, query: GetChannelVideosQueryDto) {
    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
    const sort = query.sort ?? 'newest';
  
    const channel = await this.prismaService.prisma.channel.findUnique({
      where: { username },
      select: { ownerId: true },
    });
  
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
  
    let orderBy;
    if (sort === 'popular') {
      orderBy = { viewsCount: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }
  
    const videos = await this.prismaService.prisma.video.findMany({
      where: { authorId: channel.ownerId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    });
  
    const total = await this.prismaService.prisma.video.count({
      where: { authorId: channel.ownerId },
    });
  
    return {
      data: videos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
