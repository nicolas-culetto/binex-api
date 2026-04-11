import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './models/user.model';
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
    ) { }

    public create(createUserDto: CreateUserDto): Promise<User> {
        const newUser = this.usersRepository.create(createUserDto);
        return this.usersRepository.save(newUser);
    }

    public createAdmin(createUserDto: CreateUserDto): Promise<User> {
        const newUser = this.usersRepository.create({ ...createUserDto, isAdmin: true });
        return this.usersRepository.save(newUser);
    }


    public async findAll(isActive: boolean = true): Promise<GetUserDto[]> {
        const users = await this.usersRepository.find({ where: { isActive } });

        return users.map(user => {
            const { password, ...rest } = user;
            return rest;
        })
    }

    public async findOne(id: number, isActive: boolean = true): Promise<GetUserDto> {
        const user = await this.usersRepository.findOneBy({ id, isActive });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const { password, ...rest } = user;
        return rest;
    }

    public async getPassword(id: number): Promise<string | null> {
        const user = await this.usersRepository.findOneBy({ id });

        return user?.password ?? null;
    }

    public findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ email });
    }

    public async findById(id: number): Promise<User> {
        const user = await this.usersRepository.findOneBy({ id });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    public async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        const updatedUser = { ...user, ...updateUserDto };

        return this.usersRepository.save(updatedUser);
    }

    public async remove(id: number): Promise<DeleteResult> {
        const user = await this.usersRepository.findOneBy({ id });

        // validate
        if (!user) {
            throw new NotFoundException("User not found");
        }

        // change state
        user.isActive = false;
        const result = await this.usersRepository.save(user);

        return { affected: result ? 1 : 0, raw: [] };
    }

    public async restore(
        id: number,
    ): Promise<boolean> {
        const restoredUser = await this.usersRepository.findOneBy({ id: id, isActive: false });

        // validate
        if(!restoredUser) {
            throw new NotFoundException("User not found");
        }

        // change state to active
        restoredUser.isActive = true;
        await this.usersRepository.save(restoredUser);

        return true;
    }
}
