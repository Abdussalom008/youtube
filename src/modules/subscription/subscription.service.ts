import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import PrismaService from 'src/core/database/prisma.service';
import { GetSubscriptionsQueryDto } from './dto/get.subscription.query.dto';

@Injectable()
export class SubscriptionService {
  constructor(private prismaService: PrismaService){}
  async subscribe(subscriberId: string, channelOwnerId: string) {
    if (subscriberId === channelOwnerId) {
      throw new ForbiddenException("O'zingizga obuna bo‘lolmaysiz");
    }
  
    const alreadySubscribed = await this.prismaService.prisma.subscription.findFirst({
      where: {
        subscriberId,
        channelId: channelOwnerId,
      },
    });
  
    if (alreadySubscribed) {
      throw new BadRequestException('Allaqachon obuna bo‘lgansiz');
    }
  
    await this.prismaService.prisma.subscription.create({
      data: {
        subscriberId,
        channelId: channelOwnerId,
      },
    });
  
    await this.prismaService.prisma.channel.updateMany({
      where: { ownerId: channelOwnerId },
      data: { subscribersCount: { increment: 1 } },
    });
  
    return { message: 'Obuna boldingiz' };
  }
  
  async unsubscribe(subscriberId: string, channelOwnerId: string) {
    const subscription = await this.prismaService.prisma.subscription.findFirst({
      where: {
        subscriberId,
        channelId: channelOwnerId,
      },
    });
  
    if (!subscription) {
      throw new NotFoundException('Obuna topilmadi');
    }
  
    await this.prismaService.prisma.subscription.delete({
      where: {
        id: subscription.id,
      },
    });

    await this.prismaService.prisma.channel.updateMany({
      where: { ownerId: channelOwnerId },
      data: { subscribersCount: { decrement: 1 } },
    });
  
    return { message: 'Obuna bekor qilindi' };
  }
  
  async getSubscriptions(userId: string, query: GetSubscriptionsQueryDto) {
    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
  
    const [subscriptions, total] = await this.prismaService.prisma.$transaction([
      this.prismaService.prisma.subscription.findMany({
        where: { subscriberId: userId },
        include: {
          channel: {
            select: {
              id: true,
              username: true,
              avatar: true,
              channel: {
                select: {
                  name: true,
                  banner: true,
                  subscribersCount: true,
                },
              },
            },
          },
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.prismaService.prisma.subscription.count({
        where: { subscriberId: userId },
      }),
    ]);
  
    return {
      data: subscriptions.map((s) => ({
        channelId: s.channelId,
        username: s.channel.username,
        avatar: s.channel.avatar,
        name: s.channel.channel?.name,
        banner: s.channel.channel?.banner,
        subscribersCount: s.channel.channel?.subscribersCount,
        subscribedAt: s.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  

  async getSubscriptionFeed(userId: string, query: GetSubscriptionsQueryDto) {
    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
  
    const subscribedChannelIds = await this.prismaService.prisma.subscription.findMany({
      where: { subscriberId: userId },
      select: { channelId: true },
    });
  
    const channelIds = subscribedChannelIds.map((s) => s.channelId);
  
    const [videos, total] = await this.prismaService.prisma.$transaction([
      this.prismaService.prisma.video.findMany({
        where: {
          authorId: { in: channelIds },
          visibility: 'PUBLIC',
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.prismaService.prisma.video.count({
        where: { authorId: { in: channelIds } },
      }),
    ]);
  
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
