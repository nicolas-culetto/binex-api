import { Brand } from "src/catalog/brands/models/brand.model";
import { Categories } from "src/catalog/enums/categories.enum";
import { DeleteReasons } from "src/catalog/enums/delete-reasons.enum";
import { ModelSegment } from "src/catalog/model-segments/models/model-segment.model";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Model {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({ type: 'enum', enum: Categories })
    category!: Categories;

    @ManyToOne(() => Brand, brand => brand.models)
    brand!: Brand;

    @OneToMany(() => ModelSegment, modelSegment => modelSegment.model)
    modelSegments!: ModelSegment[];

    @Column({ type: 'enum', enum: DeleteReasons, nullable: true })
    deleteReason: DeleteReasons | null = null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}