import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { JwtService } from '@nestjs/jwt';
  
  @Injectable()
  class AuthGuard implements CanActivate {
    constructor(
      private jwtService: JwtService,
      private reflect: Reflector,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers['authorization'];
      const token = authHeader?.split(' ')[1];
  
      const handler = context.getHandler();
      const isPublic = this.reflect.get<boolean>('IsPublic', handler);
  
      if (isPublic) return true;
  
      if (!token) throw new ForbiddenException('Token topilmadi');
  
      try {
        const payload = await this.jwtService.verifyAsync(token);
        request.user = payload;
        return true;
      } catch (error) {
        throw new ForbiddenException('Token noto‘g‘ri');
      }
    }
  }
  
  export default AuthGuard;
  