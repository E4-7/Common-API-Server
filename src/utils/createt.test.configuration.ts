import { TypeOrmModuleOptions } from '@nestjs/typeorm';

type Entity = any;

export const createTestConfiguration = (
  entities: Entity[],
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_TEST_DATABASE,
  entities,
  dropSchema: true,
  synchronize: true,
  logging: false,
});
