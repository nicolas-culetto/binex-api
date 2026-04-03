import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/sign_in.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { NotFoundError } from 'rxjs';
import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async signIn(signInDto: SignInDto): Promise<any> {
        const user = await this.usersService.findByEmail(signInDto.email);

        if(!user) {
            throw new NotFoundException;
        }

        // hash password
        const validation = await bcrypt.compare(signInDto.password, user.password)

        if(!validation) {
            throw new UnauthorizedException();
        }

        return await this.genJwt(user);
    }

    async register(createUserDto: CreateUserDto): Promise<any> {
        // validate used email
        const user = await this.usersService.findByEmail(createUserDto.email);

        if(user){
            throw new ConflictException;
        }

        // hash password
        const passwordHash = await this.getHash(createUserDto.password);
        createUserDto.password = passwordHash;

        const registeredUser = await this.usersService.create(createUserDto);

        return await this.genJwt(registeredUser);
    }

    async genJwt(user: User) {
        const payload = { sub: user.id, email: user.email, isAdmin: user.isAdmin };

        return {
            access_token: await this.jwtService.signAsync(payload),
        }
    }

    async getHash(password: string) {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }
}
