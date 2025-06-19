import { BadRequestException, Injectable } from '@nestjs/common';
import EmailOtpService from '../auth/email.otp.service';
import PrismaService from 'src/core/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private emailOtpService: EmailOtpService, private prismaService: PrismaService){}
  async sendEmailVerificationLink(email: string) {
    const userEmail = await this.prismaService.prisma.user.findFirst({
      where: {
        email,
      }
    })
    if (!userEmail) throw new BadRequestException("email not found")
    await this.emailOtpService.sendEmailLink(email)
    return {
      message: "sended"
    }
  }
  async verifyEmailUser(token: string){
    const data = await this.emailOtpService.getEmailToken(token);
    const parsed = JSON.parse(data as string) as { email: string };
  
    const user = await this.prismaService.prisma.user.findFirst({
      where: {
        email: parsed.email,
      }
    });
  
    if (!user) throw new BadRequestException("User not found");
  
    await this.prismaService.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        is_email_verified: true,
      },
    });
  
    return { message: "Email verified!" };
  }
  
}
