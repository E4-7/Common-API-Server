import { Logger, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { S3 } from 'aws-sdk';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [
    FilesService,
    ConfigService,
    Logger,
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
  ],
})
export class FilesModule {}
