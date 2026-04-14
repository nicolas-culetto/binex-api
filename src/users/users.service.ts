import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './models/user.model';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { DeleteResult } from 'typeorm/browser';
import { UpdateUserDto } from './dto/update.user.dto';
import { GetUserDto } from './dto/get.user.dto';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class UsersService {
    
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private loggerService: LoggerService
    ) { }

    public async create(createUserDto: CreateUserDto): Promise<User> {
        const newUser = this.usersRepository.create(createUserDto);
        const savedUser = await this.usersRepository.save(newUser);
        
        // logger
        this.loggerService.create(savedUser);
        return savedUser;
    }

    public async createAdmin(createUserDto: CreateUserDto): Promise<User> {
        const newUser = this.usersRepository.create({ ...createUserDto, isAdmin: true });
        const savedAdmin = await this.usersRepository.save(newUser);

        // logger
        this.loggerService.create(savedAdmin, "Admin");
        return savedAdmin;
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
        const user = await this.usersRepository.findOneBy({id});

        if(!user) {
            throw new NotFoundException('User not found');
        }
        
        const prev = structuredClone(user);

        // change
        const updatedUser = Object.assign(user, updateUserDto);
        const result = await this.usersRepository.save(updatedUser);

        // logger
        this.loggerService.update(prev, result);
        return result;
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


        // logger
        this.loggerService.deleteOne(result);
        return { affected: result ? 1 : 0, raw: [] };
    }

    public async restore(
        id: number,
    ): Promise<boolean> {
        const restoredUser = await this.usersRepository.findOneBy({ id: id, isActive: false });

        // validate
        if (!restoredUser) {
            throw new NotFoundException("User not found");
        }

        // change state to active
        restoredUser.isActive = true;
        const result = await this.usersRepository.save(restoredUser);

        // logger
        this.loggerService.restoreOne(result);
        return true;
    }
}
