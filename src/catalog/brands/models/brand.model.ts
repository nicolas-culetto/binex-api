import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Categories } from "../../enums/categories.enum";

@Entity()
export class Brand{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column()
    logoUrl: string;

    @Column('text', {default: [], array: true})
    categories: Categories[];
}