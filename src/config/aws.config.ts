import { registerAs } from '@nestjs/config';

export default registerAs('file', () => ({
  aws_s3_bucket_name: process.env.AWS_S3_BUCKET_NAME,
  aws_access_key: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_key: process.env.AWS_SECRET_ACCESS_KEY,
  aws_region: process.env.AWS_REGION,
  aws_s3_max_file_size: process.env.AWS_S3_MAX_FILE_SIZE,
  driver: process.env.FILE_DRIVER,
}));
