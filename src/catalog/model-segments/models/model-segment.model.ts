import { Segments } from "src/catalog/enums/segments.enum";
import { Model } from "src/catalog/models/models/model.model";
import { Product } from "src/catalog/products/models/product.model";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ModelSegment {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Model, model => model.id)
    model!: Model;

    @Column({type: 'enum', enum: Segments})
    segment!: Segments;

    @OneToMany(() => Product, product => product.modelSegment)
    products!: Product[];
}