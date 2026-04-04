import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability";
import { User } from "src/users/models/user.model";
import { Action } from "../models/action.enum";
import { Injectable } from "@nestjs/common";
import { GetUserDto } from "src/users/dto/get.user.dto";
import { Brand } from "src/catalog/brands/models/brand.model";

type Subjects = InferSubjects<typeof User| typeof Brand> | "all";

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: {isAdmin: boolean, sub: number}) {
        const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

        if (user.isAdmin) {
            can(Action.Manage, "all");
        }else{
            can(Action.Read, "all")
        }

        can(Action.Update, User, { id: user.sub });
    
        return build({
            detectSubjectType: (item) => 
                item.constructor as ExtractSubjectType<Subjects>,
        })
    }
}
