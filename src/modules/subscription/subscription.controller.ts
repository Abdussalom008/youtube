import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import AuthGuard from 'src/common/guards/auth.guard';
import { GetSubscriptionsQueryDto } from './dto/get.subscription.query.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(AuthGuard)
  @Post(':userId/subscribe')
  subscribe(
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    const subscriberId = req.user.id;
    return this.subscriptionService.subscribe(subscriberId, userId);
  }
  
  @UseGuards(AuthGuard)
  @Delete(':userId/subscribe')
  unsubscribe(
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    const subscriberId = req.user.id;
    return this.subscriptionService.unsubscribe(subscriberId, userId);
  }

  @UseGuards(AuthGuard)
  @Get()
  getSubscriptions(@Req() req, @Query() query: GetSubscriptionsQueryDto) {
    return this.subscriptionService.getSubscriptions(req.user.id, query);
  }
  
  @UseGuards(AuthGuard)
  @Get('feed')
  getSubscriptionFeed(@Req() req, @Query() query: GetSubscriptionsQueryDto) {
    return this.subscriptionService.getSubscriptionFeed(req.user.id, query);
  }
}
