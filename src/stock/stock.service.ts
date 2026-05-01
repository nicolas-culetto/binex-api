import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateSizeDto } from 'src/catalog/sizes/dtos/update.size.dto';
import { Stock } from './models/stock.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncreaseStockDto } from './dtos/increase.stock.dto';
import { ProductsService } from 'src/catalog/products/products.service';
import { CreateStockDto } from './dtos/create.stock.dto';
import { Size } from 'src/catalog/sizes/models/size.model';
import { SizesService } from 'src/catalog/sizes/sizes.service';
import { LoggerService } from 'src/logger/logger.service';
import { Product } from 'src/catalog/products/models/product.model';
import { DecreaseStockDto } from './dtos/decrease.stock.dto';
import { UpdateResult } from 'typeorm/browser';
import { AdjustStockDto } from './dtos/adjust.stock.dto';
import { Segments } from 'src/catalog/enums/segments.enum';
import { FiltersStockDto } from './dtos/filters.stock.dto';

@Injectable()
export class StockService {
    constructor(
        @InjectRepository(Stock)
        private stockRepository: Repository<Stock>,
        private productsService: ProductsService,
        private sizesService: SizesService,
        private loggerService: LoggerService
    ) { }

    private async create(createStockDto: CreateStockDto): Promise<Stock> {
        // get stock data
        const product = await this.productsService.findOne(createStockDto.productId);
        const size = await this.sizesService.findOne(createStockDto.sizeId);
        const sku = this.generateSku(product, size);

        // transform unisex segment to male for sizes convention
        if(product.modelSegment.segment == Segments.Unisex) {
            product.modelSegment.segment = Segments.Male;
        }

        // validate same segment between product and size
        if(product.modelSegment.segment != size.segment){
            throw new ConflictException("Product and size must be the same segment")
        }

        const data = {
            product,
            size,
            sku,
            amount: createStockDto.amount
        }

        // load new stock
        const newStock = this.stockRepository.create(data);
        const result = await this.stockRepository.save(newStock);

        // logger
        this.loggerService.create(result);

        return result;
    }

    public async getBySku(sku: string): Promise<Stock> {
        const res = await this.stockRepository.findOneBy({ sku });

        if (!res) {
            throw new NotFoundException("Stock not found");
        }

        return res;
    }

    public async get(filtersStockDto: FiltersStockDto): Promise<Stock[]> {
        let query = this.stockRepository.createQueryBuilder('stock')
        
        // apply filters
        if(filtersStockDto.soldOut) {
            query = query.andWhere("stock.amount = :amount", {amount: 0});
        }

        if(filtersStockDto.minAmount) {
            query = query.andWhere("stock.amount >= :amount", {amount: filtersStockDto.minAmount});
        }

        if(filtersStockDto.maxAmount) {
            query = query.andWhere("stock.amount <= :amount", {amount: filtersStockDto.maxAmount});
        }

        return query.getMany();
    }

    public async increase(productId: number, sizeId: number, increaseStockDto: IncreaseStockDto): Promise<Stock> {
        const stock = await this.stockRepository.findOneBy(
            {
                product: { id: productId },
                size: { id: sizeId }
            }
        );

        // create stock if no exists yet
        if (!stock) {
            const newStock = await this.create({...increaseStockDto, productId, sizeId});
            return newStock;
        }

        const prev = structuredClone(stock);

        // load increment
        stock.amount += increaseStockDto.amount;
        const result = await this.stockRepository.save(stock);

        // logger
        this.loggerService.update(prev, result);

        return result;
    }

    public async decrease(sku: string, decreaseStockDto: DecreaseStockDto): Promise<Stock> {
        const stock = await this.stockRepository.findOneBy({ sku });

        // create stock if no exists yet
        if (!stock) {
            throw new NotFoundException("Stock not found");
        }

        const prev = structuredClone(stock);

        // validate stock amount
        if (stock.amount < decreaseStockDto.amount) {
            throw new ConflictException("Not enough stock");
        }

        // load decrement
        stock.amount -= decreaseStockDto.amount;
        const result = await this.stockRepository.save(stock);

        // logger
        this.loggerService.update(prev, result);

        return result;
    }

    public async adjust(sku: string, adjustStockDto: AdjustStockDto): Promise<Stock> {
        const stock = await this.stockRepository.findOneBy({ sku });

        // create stock if not exists yet
        if (!stock) {
            throw new NotFoundException("Stock not found");
        }

        const prev = structuredClone(stock);

        // load decrement
        stock.amount = adjustStockDto.amount;
        const result = await this.stockRepository.save(stock);

        // logger
        this.loggerService.update(prev, result);

        return result;
    }

    private generateSku(product: Product, size: Size): string {
        // generate sku
        const brandId = product.modelSegment.model.brand.id;
        const modelId = product.modelSegment.model.id;
        const modelSegmentId = product.modelSegment.id;
        const productId = product.id;
        const sizeId = size.id;

        const sku =
            `${brandId.toString().padStart(2, '0')}` +
            `${modelId.toString().padStart(2, '0')}` +
            `${modelSegmentId.toString().padStart(2, '0')}` +
            `${productId.toString().padStart(2, '0')}` +
            `${sizeId.toString().padStart(2, '0')}`;

        return sku;
    }
}
