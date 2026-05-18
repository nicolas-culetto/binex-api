import { DeleteReasons } from "src/catalog/enums/delete-reasons.enum";
import { Segments } from "src/catalog/enums/segments.enum";
import { Model } from "src/catalog/models/models/model.model";
import { Product } from "src/catalog/products/models/product.model";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ModelSegment {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Model, model => model.id, { onDelete: 'CASCADE' })
    model!: Model;

    @Column({ type: 'enum', enum: Segments })
    segment!: Segments;

    @OneToMany(() => Product, product => product.modelSegment)
    products!: Product[];

    @Column({ type: 'enum', enum: DeleteReasons, nullable: true })
    deleteReason: DeleteReasons | null = null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}