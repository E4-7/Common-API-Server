import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  password: process.env.DB_PASSWORD,
  username: process.env.DB_USERNAME,
  name: process.env.DB_DATABASE,
}));
