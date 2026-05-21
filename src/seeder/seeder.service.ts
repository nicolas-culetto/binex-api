import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { BrandsService } from 'src/catalog/brands/brands.service';
import { ModelSegmentsService } from 'src/catalog/model-segments/model-segments.service';
import { ModelsService } from 'src/catalog/models/models.service';
import { ProductsService } from 'src/catalog/products/products.service';
import { SizesService } from 'src/catalog/sizes/sizes.service';
import fs, { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, basename } from 'path';
import * as cliProgress from 'cli-progress';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { extractPublicId } from 'cloudinary-build-url';
import { ConfigService } from '@nestjs/config';
import { Brand } from 'src/catalog/brands/models/brand.model';
import { Model } from 'src/catalog/models/models/model.model';
import { ModelSegment } from 'src/catalog/model-segments/models/model-segment.model';
import { StockService } from 'src/stock/stock.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeederService.name);
    private readonly rootPath = join(process.cwd(), 'src', 'seeder');
    private readonly stateFile = join(this.rootPath, 'state.json');

    constructor(
        private stockService: StockService,
        private sizesService: SizesService,
        private brandsService: BrandsService,
        private modelsService: ModelsService,
        private modelSegmentsService: ModelSegmentsService,
        private productsService: ProductsService,
        private cloudinaryService: CloudinaryService,
        private configService: ConfigService,
        @InjectDataSource()
        private dataSource: DataSource
    ) { }

    async onApplicationBootstrap() {
        await this.uploadEssentialData();
        //await this.saveNewSeedData();

        if (this.configService.get("runSeed")) {
            if (this.configService.get("nodeEnv") == "develop") {
                await this.uploadDevelopmentSeed();
            }
        }
    }

    //STUB - to backup data before seeding new data, and also to have a way to export data if needed in the future
    async clearData(){
        this.logger.log("Cleaning repositories...") 
        await this.dataSource.query('DROP SCHEMA public CASCADE');
        await this.dataSource.query('CREATE SCHEMA public');
        await this.dataSource.synchronize();
    }

    async saveNewSeedData() {
        try {
            await this.saveBrandImages();
            await this.saveProductsImages();
            await this.saveBrandsData();
            await this.saveModelsData();
            await this.saveModelSegmentsData();
            await this.saveProductsData();
            await this.saveSizesData();
        } catch (error) {
            this.logger.error(error);
        }
    }

    private async saveProductsImages() {
        const bar = new cliProgress.SingleBar({
            format: 'Saving product images |{bar}| {percentage}% | {value}/{total}',
            barCompleteChar: '█',
            barIncompleteChar: '░',
        });

        try {
            const products = await this.productsService.findAll();
            const images = products.flatMap(product => product.images_url);

            // start progress bar
            bar.start(images.length, 0);

            await Promise.all(images.map(async element => {
                await this.saveImage(element, "src/seeder/assets/" + element.slice(76));
                bar.increment();
            }));
        } catch (error) {
            this.logger.error(error);
        } finally {
            bar.stop();
            this.logger.log('Product images loaded');
        }
    }

    private async saveBrandImages() {
        const bar = new cliProgress.SingleBar({
            format: 'Saving brand images |{bar}| {percentage}% | {value}/{total}',
            barCompleteChar: '█',
            barIncompleteChar: '░',
        });

        try {
            const brands = await this.brandsService.findAll();
            const images = brands.map(brand => brand.logoUrl);

            // start progress bar
            bar.start(images.length, 0);

            await Promise.all(images.map(async element => {
                await this.saveImage(element, "src/seeder/assets/" + element.slice(76));
                bar.increment();
            }));
        } catch (error) {
            this.logger.error(error);
        } finally {
            bar.stop();
            this.logger.log('Brand images seeded');
        }
    }

    async saveBrandsData() {
        try {
            const brands = await this.brandsService.findAll();
            await this.saveData(brands, "brands.json");
            this.logger.log('Brands data seeded');
        } catch (error) {
            this.logger.error(error);
        }
    }

    async saveModelsData() {
        try {
            const models = await this.modelsService.findAll();

            // normalizar relacion
            models.forEach(model => {
                model.brand = { id: model.brand.id } as Brand;
            })

            await this.saveData(models, "models.json");
            this.logger.log('Models data seeded');
        } catch (error) {
            this.logger.error(error);
        }
    }

    async saveModelSegmentsData() {
        try {
            const modelSegments = await this.modelSegmentsService.findAll();

            // normalizar relacion
            modelSegments.forEach(modelSegment => {
                modelSegment.model = { id: modelSegment.model.id } as Model;
            })

            await this.saveData(modelSegments, "modelSegments.json");
            this.logger.log('Model segments data seeded');
        } catch (error) {
            this.logger.error(error);
        }
    }

    async saveProductsData() {
        try {
            const products = await this.productsService.findAll();

            // normalizar relacion
            products.forEach(product => {
                product.modelSegment = { id: product.modelSegment.id } as ModelSegment;
            })

            await this.saveData(products, "products.json");
            this.logger.log('Products data seeded');
        } catch (error) {
            this.logger.error(error);
        }
    }

    async saveSizesData() {
        try {
            const sizes = await this.sizesService.findAll();

            // normalizar relacion
            sizes.forEach(size => {
                size.brand = { id: size.brand.id } as Brand;
            })

            await this.saveData(sizes, "sizes.json");
            this.logger.log('Sizes data seeded');
        } catch (error) {
            this.logger.error(error);
        }
    }

    private async saveImage(url: string, path: string) {
        const res = await fetch(url);

        if (!res.ok) {
            const error = await res.json();
            throw new Error(JSON.stringify(error));
        }

        // data buffer
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // save into path
        await fs.mkdir(dirname(path), { recursive: true });
        await fs.writeFile(path, buffer);
    }

    private async saveData(data: any[], path: string) {
        // save into path
        const fullPath = join("src/seeder/data", path);
        await fs.mkdir(dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, JSON.stringify(data, null, 2));
    }

    //STUB - to load essential data that is required for the app to run, like admin user, default settings, etc.
    private async uploadEssentialData() {

    }

    private async uploadDevelopmentSeed() {
        // clear data
        await this.clearData();

        // check images and reupload to prevent conflicts
        await this.reploadImages();

        const bar = new cliProgress.SingleBar({
            format: 'Loading develpment seed |{bar}| {percentage}% | {value}/{total}',
            barCompleteChar: '█',
            barIncompleteChar: '░',
        });

        const loaders = [
            () => this.uploadBrands(),
            () => this.uploadModels(),
            () => this.uploadModelSegments(),
            () => this.uploadProducts(),
            () => this.uploadSizes(),
        ]

        bar.start(loaders.length, 0);

        for (let loader of loaders) {
            await loader();

            bar.increment();
        }

        bar.stop();
        this.logger.log("Development seed uploaded");
    }

    private async uploadBrands() {
        const brandsData = await this.readLocalJson("brands.json");
        await this.brandsService.uploadData(brandsData);
    }

    private async uploadModels() {
        const modelsData = await this.readLocalJson("models.json");
        await this.modelsService.uploadData(modelsData);
    }

    private async uploadModelSegments() {
        const modelSegmentsData = await this.readLocalJson("modelSegments.json");
        await this.modelSegmentsService.uploadData(modelSegmentsData);
    }

    private async uploadProducts() {
        const productsData = await this.readLocalJson("products.json");
        await this.productsService.uploadData(productsData);
    }

    private async uploadSizes() {
        const sizesData = await this.readLocalJson("sizes.json");
        await this.sizesService.uploadData(sizesData);
    }

    private async reploadImages(): Promise<void> {
        const reuploadBar = new cliProgress.SingleBar({
            format: `Reuploading cloud images |{bar}| {percentage}% | {value}/{total}`,
            barCompleteChar: '█',
            barIncompleteChar: '░',
        });

        const checkBar = new cliProgress.SingleBar({
            format: `Checking cloud images |{bar}| {percentage}% | {value}/{total}`,
            barCompleteChar: '█',
            barIncompleteChar: '░',
        });

        const brands = await this.readLocalJson("brands.json");
        const products = await this.readLocalJson("products.json");

        const brandImages = brands.map(brand => brand.logoUrl);
        const productsImages = products.flatMap(prod => prod.images_url);
        const images = [...brandImages, ...productsImages];
        const notFoundImages: string[] = [];

        // check if cloud images are right 
        checkBar.start(images.length, 0);
        for (let image of images) {
            const response = await fetch(image);

            checkBar.increment();

            if (!response.ok) {
                notFoundImages.push(image);
            }
        }
        checkBar.stop();

        // repload
        if (notFoundImages.length > 0) {
            this.logger.warn(`${notFoundImages.length} cloud images are lost`);
            reuploadBar.start(notFoundImages.length, 0);

            try {
                for (let image of notFoundImages) {
                    // get file from local storage
                    const publicId = extractPublicId(image);
                    const splicedPublicId = publicId.split("/");
                    const root = splicedPublicId[2];

                    const pathStart = image.indexOf(root);
                    const path = image.slice(pathStart);
                    const localPath = join(this.rootPath, 'assets', path);

                    // upload
                    const fileImg = await this.pathToMulterFile(localPath);
                    const uploadName = splicedPublicId.reverse()[0];
                    const uploadPathStart = publicId.indexOf(root);
                    const uploadPathEnd = publicId.indexOf(uploadName) - 1;
                    const uploadPath = publicId.slice(uploadPathStart, uploadPathEnd);

                    await this.cloudinaryService.uploadFile(fileImg, uploadPath, uploadName);

                    reuploadBar.increment();
                }

                reuploadBar.stop();
                this.logger.log("All lost cloud images were reuploaded");
            }
            catch (error) {
                reuploadBar.stop();
                this.logger.error("Error in images reupload: ", error);
            }
        } else {
            this.logger.log("All cloud images are right");
        }
    }

    private async readLocalJson(filename: string) {
        const path = join(this.rootPath, 'data', filename);
        const content = await readFile(path, "utf-8");
        const data = JSON.parse(content);
        return data;
    }

    private async pathToMulterFile(filePath: string): Promise<Express.Multer.File> {
        const buffer = await readFile(filePath);
        const filename = basename(filePath);
        const mimetype = this.getMimeType(filename);

        return {
            fieldname: 'file',
            originalname: filename,
            encoding: '7bit',
            mimetype,
            buffer,
            size: buffer.length,
            stream: null,
            destination: '',
            filename,
            path: filePath,
        } as unknown as Express.Multer.File;
    }

    private getMimeType(filename: string): string {
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
        };
        return mimeTypes[ext ?? ''] ?? 'application/octet-stream';
    }
}
