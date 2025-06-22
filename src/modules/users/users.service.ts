import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import EmailOtpService from '../auth/email.otp.service';
import PrismaService from 'src/core/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private emailOtpService: EmailOtpService, private prismaService: PrismaService){}
  async create(createUserDto: CreateUserDto) {
    return this.prismaService.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prismaService.prisma.user.findMany();
  }

  async findOne(id: string) {
    const user = await this.prismaService.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prismaService.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    const user = await this.prismaService.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prismaService.prisma.user.delete({ where: { id } });
  }

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
