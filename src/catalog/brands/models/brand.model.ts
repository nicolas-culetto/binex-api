import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Categories } from "../../enums/categories.enum";
import { Model } from "src/catalog/models/models/model.model";
import { Size } from "src/catalog/sizes/models/size.model";

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

    @OneToMany(() => Size, size => size.brand)
    sizes!: Size[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}