import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './core/core.module';
import { VideosModule } from './modules/videos/videos.module';
import { DatabaseModule } from './core/database/database.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ChanelsModule } from './modules/chanels/chanels.module';
import { AdminModule } from './modules/admin/admin.module';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { CommentsModule } from './modules/comments/comments.module';
import { LikesModule } from './modules/likes/likes.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PlaylistvideoModule } from './modules/playlistvideo/playlistvideo.module';
import TransformInterceptor from './common/interceptors/transform.interceptor';

@Module({
  imports: [UsersModule, AuthModule, CoreModule, VideosModule, DatabaseModule, ChanelsModule, AdminModule, PlaylistModule, CommentsModule, LikesModule, SubscriptionModule, PlaylistvideoModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_INTERCEPTOR,
    useClass: TransformInterceptor
  }],
})
export class AppModule {}
