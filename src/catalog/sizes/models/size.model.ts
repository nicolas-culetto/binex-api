import { Brand } from "src/catalog/brands/models/brand.model";
import { Segments } from "src/catalog/enums/segments.enum";
import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
}