import { CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import { IS_PUBLIC_KEY } from 'src/public/public.decorator';
import { UsersService } from 'src/users/users.service';
import { AUTH_COOKIE_NAME } from './cookie.config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, 
    private reflector: Reflector, 
    private userService: UsersService,
    private cls: ClsService
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if(isPublic) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("Token not found");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      // validate if user exists
      await this.userService.findOne(payload.sub);

      request['user'] = payload;

      //save id in memory to logger
      this.cls.set('user', payload);
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
    
    return true;
  }

  private extractToken(request: Request): string | undefined {
      // prioridad a la cookie
      const fromCookie = request.cookies?.[AUTH_COOKIE_NAME];
      if (fromCookie) return fromCookie;

      // opcional: fallback a Bearer (útil para Postman, apps móviles, tests)
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
  }
}