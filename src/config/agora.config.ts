import { registerAs } from '@nestjs/config';

export default registerAs('agora', () => ({
  appId: process.env.AGORA_APP_ID,
  authentic_key: process.env.AGORA_APP_AUTHENTIC_KEY,
}));
