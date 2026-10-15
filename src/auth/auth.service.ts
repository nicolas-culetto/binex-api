import { ConflictException, Injectable, NotFoundException, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/sign_in.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { User } from 'src/users/models/user.model';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async onApplicationBootstrap() {
        await this.createRootAdmin()
    }

    private async createRootAdmin(): Promise<void>{
        const adminDto = {    
            email: this.configService.getOrThrow('rootAdminEmail'),
            password: this.configService.getOrThrow('rootAdminPassword'),
            firstName: this.configService.getOrThrow('rootAdminFirstName'),
            lastName: this.configService.getOrThrow('rootAdminLastName'),
        }

        const validation = await this.usersService.findByEmail(adminDto.email);

        if(validation){
            return;
        }

        // create admin
        this.register(adminDto, true);
    }

    async signIn(signInDto: SignInDto): Promise<any> {
        const user = await this.usersService.findByEmail(signInDto.email);

        if(!user) {
            throw new NotFoundException("User not found");
        }

        // hash password
        const validation = await bcrypt.compare(signInDto.password, user.password)

        if(!validation) {
            throw new UnauthorizedException("Wrong password");
        }

        return await this.genJwt(user);
    }

    async register(createUserDto: CreateUserDto, isAdmin: boolean = false): Promise<any> {
        let registeredUser: User;
        
        // validate used email
        const user = await this.usersService.findByEmail(createUserDto.email);

        if(user){
            throw new ConflictException("Email is used");
        }

        // hash password
        const passwordHash = await this.getHash(createUserDto.password);
        createUserDto.password = passwordHash;

        // create user
        registeredUser = (isAdmin)? 
        await this.usersService.createAdmin(createUserDto) : 
        await this.usersService.create(createUserDto);

        return await this.genJwt(registeredUser);
    }

    async genJwt(user: User): Promise<string> {
        const payload = { sub: user.id, email: user.email, isAdmin: user.isAdmin };
        return await this.jwtService.signAsync(payload);
    }

    async getHash(password: string) {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }
}
