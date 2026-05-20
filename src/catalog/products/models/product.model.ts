import { Colors } from "src/catalog/enums/colors.enum";
import { DeleteReasons } from "src/catalog/enums/delete-reasons.enum";
import { ModelSegment } from "src/catalog/model-segments/models/model-segment.model";
import { Model } from "src/catalog/models/models/model.model";
import { Stock } from "src/stock/models/stock.model";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    color!: Colors;

    @Column('text', { array: true, default: [] })
    images_url!: string[];

    @Column()
    price!: number;

    @Column({ default: 0 })
    discount!: number;

    @ManyToOne(() => ModelSegment, modelSegment => modelSegment.products)
    modelSegment!: ModelSegment;

    @OneToMany(() => Stock, stock => stock.product)
    stocks!: Stock[]

    @Column({ type: 'enum', enum: DeleteReasons, nullable: true})
    deleteReason: DeleteReasons | null = null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}