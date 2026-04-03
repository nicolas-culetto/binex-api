import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability";
import { User } from "src/users/entities/user.entity";
import { Action } from "../models/action.enum";
import { Injectable } from "@nestjs/common";
import { GetUserDto } from "src/users/dto/get.user.dto";

type Subjects = InferSubjects<typeof User> | "all";

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: {isAdmin: boolean, sub: number}) {
        const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

        if (user.isAdmin) {
            can(Action.Manage, "all");
        } 

        can(Action.Read, User);
        can(Action.Update, User, { id: user.sub });
        cannot('delete', User);
    
        return build({
            detectSubjectType: (item) => 
                item.constructor as ExtractSubjectType<Subjects>,
        })
    }
}
