import Joi from 'joi';

export const validationSchema = Joi.object({
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
  AWS_S3_BUCKET_NAME: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_S3_MAX_FILE_SIZE: Joi.string().required(),
  FILE_DRIVER: Joi.string().valid('local', 's3').default('local'),
  AGORA_APP_ID: Joi.string().required(),
  AGORA_APP_AUTHENTIC_KEY: Joi.string().required(),
});
