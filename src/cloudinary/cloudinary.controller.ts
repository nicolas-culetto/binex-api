import { Body, Controller, Delete, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { Public } from 'src/public/public.decorator';

@Controller('cloudinary')
export class CloudinaryController {
constructor (private cloudinaryService: CloudinaryService) {}
    
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadFile(file, "test", "test");
  }

  @Delete('remove')
  deleteImage(@Body('url') url: string) {
    return this.cloudinaryService.removeFile(url);
  }
}
