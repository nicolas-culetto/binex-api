import { Brand } from "src/catalog/brands/models/brand.model";
import { Categories } from "src/catalog/enums/categories.enum";
import { DeleteReasons } from "src/catalog/enums/delete-reasons.enum";
import { ModelSegment } from "src/catalog/model-segments/models/model-segment.model";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Model{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique: true})
    name!: string;

    @Column({type: 'enum', enum: Categories})
    category!: Categories;
    
    @ManyToOne(() => Brand, brand => brand.models)
    brand!: Brand;

    @OneToMany(() => ModelSegment, modelSegment => modelSegment.model)
    modelSegments!: ModelSegment[];

    @Column({default: true})
    isActive!: boolean;

    @Column({type: 'enum', enum: DeleteReasons, default: DeleteReasons.None})
    deleteReason!: DeleteReasons;
}