import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import OtpService from './otp.service';
import SmsService from './sms.service';
import OtpSecurityService from './otp.security.service';
import EmailOtpService from './email.otp.service';
import { ResendModule, ResendService } from 'nestjs-resend';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
    OtpService,
    SmsService,
    OtpSecurityService,
    EmailOtpService,
  ],
  exports: [
    AuthService,
    OtpSecurityService,
    OtpService,
    SmsService,
    EmailOtpService,
  ],
})
export class AuthModule {}
