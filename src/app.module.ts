import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamModule } from './exam/exam.module';
import * as ormconfig from '../ormconfig';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import winston from 'winston';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [appConfig, authConfig, databaseConfig],
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'stage', 'local')
          .default('local'),
        APP_NAME: Joi.string().default('E4/7'),
        APP_HOST: Joi.string().default('localhost'),
        npm_package_version: Joi.string().default('0.01'),
        APP_PORT: Joi.number().default(3000),
        BACKEND_DOMAIN: Joi.string().default('localhost'),
        FRONTEND_DOMAIN: Joi.string().default(['*']),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(3306),
        DB_PASSWORD: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        SECRET: Joi.string().required(),
        COOKIE_SECRET: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot(ormconfig),
    UsersModule,
    AuthModule,
    ExamModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('E47', {
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
