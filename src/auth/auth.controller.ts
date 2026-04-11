import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign_in.dto';
import { AuthGuard } from './auth.guard';
import { Public } from 'src/public/public.decorator';
import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { Action } from 'src/casl/models/action.enum';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('login')
    signIn(@Body() signInDto: SignInDto) {
        return this.authService.signIn(signInDto);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.email;
    }

    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('sign-up')
    async signUp(@Body() createUserDto: CreateUserDto) {
        return await this.authService.register(createUserDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('sign-up-admin')
    @UseGuards(AuthGuard)
    @CheckPolicies((ability) => ability.can(Action.Create, 'admin'))
    async signUpAdmin(@Body() createUserDto: CreateUserDto) {
        return await this.authService.register(createUserDto, true);
    }
}
