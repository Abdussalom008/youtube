import { Module } from '@nestjs/common';
import { ChanelsService } from './chanels.service';
import { ChanelsController } from './chanels.controller';

@Module({
  controllers: [ChanelsController],
  providers: [ChanelsService],
})
export class ChanelsModule {}
