import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { CatalogModule } from './catalog/catalog.module';
import { EventEmitter } from 'stream';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from './logger/logger.module';
import { ClsModule } from 'nestjs-cls';
import { SearchModule } from './search/search.module';
import { SizesModule } from './catalog/sizes/sizes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: configService.getOrThrow<'postgres'|'mysql'>('database.type'),
        url: configService.getOrThrow<string>('database.url'),
        host: configService.getOrThrow<string>('database.host'),
        port: configService.getOrThrow<number>('database.port'),
        username: configService.getOrThrow<string>('database.username'),
        password: configService.getOrThrow<string>('database.password'),
        database: configService.getOrThrow<string>('database.database'),
        autoLoadEntities: true,
        entities: [],
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    SizesModule,
    CaslModule,
    CloudinaryModule,
    CatalogModule,
    EventEmitterModule.forRoot(),
    LoggerModule,
    ClsModule.forRoot({
      global: true,
      middleware: {mount: true}
    }),
    SearchModule
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryProvider ],
})
export class AppModule {}
