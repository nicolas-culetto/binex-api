import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from 'cloudinary-build-url';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
    private rootFolder: string;
    constructor (private configService: ConfigService) {
        this.rootFolder = this.configService.getOrThrow("nodeEnv");
    }

    uploadFile(file: Express.Multer.File, path: string, name: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `/binex/${this.rootFolder}/${path}`,
                    public_id: name,
                    overwrite: true,
                    format: 'webp'
                },
                (error, result) => {
                    if (error) return reject(error);

                    if (result) resolve(result.secure_url);
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    removeFile(url: string): Promise<void> {
        const publicId = extractPublicId(url);
        return new Promise<void>((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) return reject(error);
                if (result) resolve(result);
            });
        });
    }
}
