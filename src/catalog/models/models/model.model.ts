import { Brand } from "src/catalog/brands/models/brand.model";
import { Categories } from "src/catalog/enums/categories.enum";
import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Model{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column()
    category: Categories;
    
    @ManyToOne(() => Brand)
    brand: Brand;
}