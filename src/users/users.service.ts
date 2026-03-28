import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { DeleteResult } from 'typeorm/browser';
import { UpdateUserDto } from './dto/update.user.dto';

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

    public findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    public findOne(id: number): Promise<User | null> {
        return this.usersRepository.findOneBy({ id });
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
