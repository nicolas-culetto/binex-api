import { Body, Controller, Delete, Get, Param, Post, Put, Query} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { Public } from 'src/public/public.decorator';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService){}

    @Post("create")
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto);
    }

    @Delete("remove")
    async remove(@Query('id') id: number) {
        return await this.userService.remove(id);
    }

    @Put("update/:id")
    async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
        return await this.userService.update(id, updateUserDto);
    }

    @Public()
    @Get("all")
    async findAll(): Promise<any> {
        return await this.userService.findAll();
    }

    @Get(":id")
    async findOne(@Param('id') id: number): Promise<any> {
        return await this.userService.findOne(id);
    }
}
