import { Product } from "src/catalog/products/models/product.model";
import { Size } from "src/catalog/sizes/models/size.model";
import { Check, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity()
@Check("MIN_STOCK_AMOUNT", '"amount" >= 0')
@Unique(["sku"])
export class Stock{
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Product, product => product.stocks, {onDelete: 'CASCADE'})
    product!: Product;

    @Column({default: 0})
    amount!: number;

    @ManyToOne(() => Size, product => product.stocks, {onDelete: 'CASCADE'})
    size!: Size;

    @Column()
    @Index()
    sku!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date

    @DeleteDateColumn()
    deletedAt!: Date
}   