import { Brand } from "src/catalog/brands/models/brand.model";
import { Segments } from "src/catalog/enums/segments.enum";
import { Product } from "src/catalog/products/models/product.model";
import { Stock } from "src/stock/models/stock.model";
import { Column, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Size{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'enum', enum: Segments})
    segment!: Segments;

    @ManyToOne(() => Brand, brand => brand.sizes)
    brand!: Brand;

    @Column('float')
    cm!: number;

    @Column('float')
    eu!: number;

    @Column()
    us!: string;

    @Column()
    uk!: string;

    @DeleteDateColumn()
    deletedAt!: Date;

    @OneToMany(() => Stock, Product => Product.size)
    stocks!: Stock[];
}