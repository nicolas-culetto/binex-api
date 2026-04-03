import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryResponse } from './cloudinary-response';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
    uploadFile(file: Express.Multer.File, path: string, name: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `/binex/${path}`,
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
}
