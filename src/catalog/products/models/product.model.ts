import { Colors } from "src/catalog/enums/colors.enum";
import { DeleteReasons } from "src/catalog/enums/delete-reasons.enum";
import { ModelSegment } from "src/catalog/model-segments/models/model-segment.model";
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

    @ManyToOne(() => ModelSegment, modelSegment => modelSegment.products, {onDelete: 'CASCADE'})
    modelSegment!: ModelSegment;

    @Column({default: true})
    isActive!: boolean;

    @Column({type: 'enum', enum: DeleteReasons, default: DeleteReasons.None})
    deleteReason!: DeleteReasons;
}