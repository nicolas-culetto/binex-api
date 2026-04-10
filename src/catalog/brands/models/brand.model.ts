import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Categories } from "../../enums/categories.enum";
import { Model } from "src/catalog/models/models/model.model";

@Entity()
export class Brand{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique: true})
    name!: string;

    @Column()
    logoUrl!: string;

    @OneToMany(() => Model, model => model.brand)
    models!: Model[];

    @Column({default: true})
    isActive!: boolean;
}