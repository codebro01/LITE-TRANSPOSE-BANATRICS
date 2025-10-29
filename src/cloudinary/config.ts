import { v2 as cloudinary, ConfigOptions } from 'cloudinary';

const options: ConfigOptions = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
};

// ! tell TS/ESLint what this call actually is

(cloudinary.config as (options: ConfigOptions) => void)(options);
export { cloudinary };
