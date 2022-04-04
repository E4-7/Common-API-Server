import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
declare type TypeOrmSeedingOptions = {
  seeds: Array<string>;
  factories: Array<string>;
};
const config: TypeOrmModuleOptions & TypeOrmSeedingOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [path.join(__dirname, '/src/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '/src/common/database/migrations/*.ts')],
  cli: { migrationsDir: 'src/common/database/migrations' },
  seeds: ['src/common/database/seeds/**/*.seed.ts'], // seed파일들을 생성할 경로
  factories: ['src/common/database/factories/**/*.factory.ts'],
  autoLoadEntities: true,
  charset: 'utf8mb4',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  keepConnectionAlive: true,
};
export = config;
