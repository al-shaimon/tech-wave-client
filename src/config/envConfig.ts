const envConfig = {
  baseApi: process.env.NEXT_PUBLIC_BASE_API,
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  node_env: process.env.NODE_ENV,
};

export default envConfig;
