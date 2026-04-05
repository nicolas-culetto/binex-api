import { Colors } from "src/catalog/enums/colors.enum";
import { Model } from "src/catalog/models/models/model.model";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    color!: Colors;

    @Column('text', {array: true})
    images_url!: string[];

    @Column()
    price!: number;

    @Column({default: 0})
    discount!: number;

    @ManyToOne(() => Model)
    model!: Model;
}