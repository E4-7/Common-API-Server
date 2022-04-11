import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret: process.env.SECRET,
  cookie_secret: process.env.COOKIE_SECRET,
}));
