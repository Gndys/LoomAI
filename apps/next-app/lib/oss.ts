import OSS from "ali-oss";

export const createOssClient = () => {
  const region = process.env.ALIYUN_OSS_REGION;
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  const bucket = process.env.ALIYUN_OSS_BUCKET;

  if (!region || !accessKeyId || !accessKeySecret || !bucket) {
    throw new Error("Missing OSS configuration");
  }

  return new OSS({
    region,
    accessKeyId,
    accessKeySecret,
    bucket,
    secure: true,
  });
};
