import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import winston from 'winston';
import { ConfigService } from '@nestjs/config';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(process.env.APP_NAME, {
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
  });
  const configService = app.get(ConfigService);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('E4/7 Swagger Docs')
    .setDescription('E4/7 Common Server Swagger API')
    .setVersion(process.env.npm_package_version)
    .addCookieAuth('connect.sid')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(helmet());
  app.use(cookieParser());
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: configService.get('auth.cookie_secret'),
      cookie: {
        httpOnly: true,
      },
      //TODO : DB or redis Session mapping
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  const PORT = configService.get('app.port') || 3000;

  await app.listen(PORT);
  console.log(`server listening on port ${PORT}`);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
