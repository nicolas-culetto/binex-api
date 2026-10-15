import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AUTH_COOKIE_NAME, authCookieOptions } from './cookie.config';
import { GetUserDto } from 'src/users/dto/get.user.dto';
import { SignInDto } from './dto/sign_in.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { Public } from 'src/public/public.decorator';
import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { Action } from 'src/casl/models/action.enum';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private configService: ConfigService,
    ) { }

    private get isProd() {
        return this.configService.get('NODE_ENV') === 'production';
    }

    private setAuthCookie(res: Response, token: string) {
        res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions(this.isProd));
    }

    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('login')
    async signIn(
        @Body() signInDto: SignInDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const token = await this.authService.signIn(signInDto);
        this.setAuthCookie(res, token);
        return { message: 'Logged in' };
    }

    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('sign-up')
    async signUp(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const token = await this.authService.register(createUserDto);
        this.setAuthCookie(res, token);
        return { message: 'Registered' };
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        // las opciones (path, sameSite, secure) deben coincidir con las de la cookie original
        const { maxAge, ...opts } = authCookieOptions(this.isProd);
        res.clearCookie(AUTH_COOKIE_NAME, opts);
        return { message: 'Logged out' };
    }

    @Get('profile')
    async getProfile(@Req() req): Promise<GetUserDto> {
        return this.usersService.findOne(req.user.sub);
    }

    @HttpCode(HttpStatus.OK)
    @Post('sign-up-admin')
    @UseGuards(AuthGuard)
    @CheckPolicies((ability) => ability.can(Action.Create, 'admin'))
    async signUpAdmin(@Body() createUserDto: CreateUserDto) {
        await this.authService.register(createUserDto, true);
        return { message: 'Admin created' };
    }
}