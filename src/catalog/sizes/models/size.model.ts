import { Brand } from "src/catalog/brands/models/brand.model";
import { Segments } from "src/catalog/enums/segments.enum";
import { Product } from "src/catalog/products/models/product.model";
import { Stock } from "src/stock/models/stock.model";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;

    @OneToMany(() => Stock, Product => Product.size)
    stocks!: Stock[];
}