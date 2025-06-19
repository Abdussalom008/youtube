import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import EmailOtpService from '../auth/email.otp.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, EmailOtpService],
})
export class UsersModule {}
