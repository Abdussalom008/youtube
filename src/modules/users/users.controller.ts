import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("email/verification-link")
  @HttpCode(200)
  async sendEmailVerificationLink(@Body() data: {email: string}) {
    return await this.usersService.sendEmailVerificationLink(data.email);
  }
  @Get('user/verify-email')
  async verifyEmailUser(@Query('token') token: string){
    return await this.usersService.verifyEmailUser(token)
  }
}
