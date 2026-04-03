import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { DeleteResult } from 'typeorm/browser';
import { UpdateUserDto } from './dto/update.user.dto';
import { NotFoundError } from 'rxjs';
import { GetUserDto } from './dto/get.user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ){}

    public create(createUserDto: CreateUserDto): Promise<User> {
        const newUser = this.usersRepository.create(createUserDto);

        return this.usersRepository.save(newUser);
    }

    public async findAll(): Promise<GetUserDto[]> {
        const users = await  this.usersRepository.find();

        return users.map(user => {
            const { password, ...rest } = user;
            return rest;
        })
    }

    public async findOne(id: number): Promise<GetUserDto> {
        const user = await this.usersRepository.findOneBy({ id });

        if(!user){
            throw new NotFoundException;
        }

        const { password, ...rest } = user;
        return rest;
    }

    public async getPassword(id: number): Promise<string | null> {
        const user = await this.usersRepository.findOneBy({id});

        return user?.password ?? null;
    }

    public findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ email });
    }

    public async findById(id: number): Promise<User> {
        const user = await this.usersRepository.findOneBy({ id });

        if(!user){
            throw new NotFoundException;
        }

        return user;
    }

    public async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        const updatedUser = {...user, ...updateUserDto};

        return this.usersRepository.save(updatedUser);
    }

    public async remove(id: number): Promise<DeleteResult> {
        return this.usersRepository.delete(id);
    }
}
