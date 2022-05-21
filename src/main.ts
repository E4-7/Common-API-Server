import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import redis from 'redis';
import connectRedis from 'connect-redis';
import session from 'express-session';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import winston from 'winston';
import { ConfigService } from '@nestjs/config';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { RolesGuard } from './common/guards/roles.guard';
import compression from 'compression';

declare const module: any;

async function bootstrap() {
  initializeTransactionalContext(); // Initialize cls-hooked
  patchTypeORMRepositoryWithBaseRepository(); // patch Repository with BaseRepository.
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
  const reflector = app.get(Reflector);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalGuards(new RolesGuard(reflector));

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
  app.use(compression());
  app.use(cookieParser());
  app.set('trust proxy', 1);
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: configService.get('auth.cookie_secret'),
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      proxy: true,
      cookie: {
        maxAge: 100 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      },
      //TODO: logout시, redis session 삭제하도록
    }),
  );
  /*
  https://expressjs.com/ko/advanced/best-practice-security.html
  app.use(session({
  name: 'session',
  keys: ['key1', 'key2'],
  cookie: {
    secure: true,
    httpOnly: true,
    domain: 'example.com',
    path: 'foo/bar',
    expires: expiryDate
  }
}))
   */
  app.use(passport.initialize());
  app.use(passport.session());

  const PORT = configService.get('app.port') || 80;

  await app.listen(PORT);
  console.log(`server listening on port ${PORT}`);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
