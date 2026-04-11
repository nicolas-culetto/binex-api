import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability";
import { User } from "src/users/models/user.model";
import { Action } from "../models/action.enum";
import { Injectable } from "@nestjs/common";
import { GetUserDto } from "src/users/dto/get.user.dto";
import { Brand } from "src/catalog/brands/models/brand.model";
import { Model } from "src/catalog/models/models/model.model";
import { Product } from "src/catalog/products/models/product.model";
import { ModelSegment } from "src/catalog/model-segments/models/model-segment.model";

type Subjects = InferSubjects<typeof User| typeof Brand | typeof ModelSegment | typeof Model | typeof Product> | "admin" | "all";

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
        can(Action.Delete, User, { id: user.sub });
    
        return build({
            detectSubjectType: (item) => 
                item.constructor as ExtractSubjectType<Subjects>,
        })
    }
}
