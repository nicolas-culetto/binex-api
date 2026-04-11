import { Body, Controller, Delete, ForbiddenException, Get, Param, Put, Query, Req, UseGuards} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update.user.dto';
import { User } from './models/user.model';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { AppAbility, CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { PoliciesGuard } from 'src/casl/guards/policies/policies.guard';
import { Action } from 'src/casl/models/action.enum';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService, private castAbilityFcatory: CaslAbilityFactory){}

    @Delete("remove")
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, User))
    async remove(@Req() req, @Query('id') id: number) {
        // check authorization
        const targetUser = await this.userService.findById(id);
        const ability = this.castAbilityFcatory.createForUser(req.user);

        if (!ability.can(Action.Delete, targetUser)) {
            throw new ForbiddenException();
        }

        return await this.userService.remove(id);
    }

    @Put("restore")
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, User))
    async restore(@Req() req, @Query('id') id: number) {
        // check authorization
        const targetUser = await this.userService.findById(id);
        const ability = this.castAbilityFcatory.createForUser(req.user);

        if (!ability.can(Action.Update, targetUser)) {
            throw new ForbiddenException();
        }

        return await this.userService.restore(id);
    }

    @Put("update/:id")
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, User))
    async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @Req() req) {
        // check authorization
        const targetUser = await this.userService.findById(id);
        const ability = this.castAbilityFcatory.createForUser(req.user);

        if (!ability.can(Action.Update, targetUser)) {
            throw new ForbiddenException();
        }

        return await this.userService.update(id, updateUserDto);
    }

    @Get("all")
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, User))
    async findAll(
        @Query('isActive') isActive: boolean = true
    ): Promise<any> {
        return await this.userService.findAll(isActive);
    }

    @Get(":id")
    @UseGuards(PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, User))
    async findOne(
        @Param('id') id: number,
        @Query('isActive') isActive: boolean = true
    ): Promise<User | any> {
        return await this.userService.findOne(id, isActive);
    }
}
