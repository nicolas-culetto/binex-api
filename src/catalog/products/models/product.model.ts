import { Colors } from "src/catalog/enums/colors.enum";
import { Segments } from "src/catalog/enums/segments.enum";
import { Model } from "src/catalog/models/models/model.model";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    color!: Colors;

    @Column('text', {array: true, default:[]})
    images_url!: string[];

    @Column()
    price!: number;

    @Column({default: 0})
    discount!: number;

    @Column({type: 'enum', enum: Segments})
    segment!: Segments;

    @ManyToOne(() => Model)
    model!: Model;
}