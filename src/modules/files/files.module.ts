import { Logger, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { S3 } from 'aws-sdk';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Files } from './entities/file.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Files])],
  providers: [
    FilesService,
    ConfigService,
    {
      provide: S3,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new S3({
          accessKeyId: configService.get('file.aws_access_key'),
          secretAccessKey: configService.get('file.aws_secret_key'),
          region: configService.get('file.aws_region'),
        }),
    },
    Logger,
  ],
  exports: [FilesService],
})
export class FilesModule {}
