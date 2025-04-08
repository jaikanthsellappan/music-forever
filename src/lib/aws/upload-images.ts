import AWS from 'aws-sdk';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import mime from 'mime-types';

// AWS setup
const credentials = new AWS.SharedIniFileCredentials({ profile: 'student' });
AWS.config.credentials = credentials;
AWS.config.update({ region: 'us-east-1' });

const s3 = new AWS.S3();
const BUCKET_NAME = 'music-forever-artist-images';
const REGION = 'us-east-1';

export async function uploadArtistImages() {
  const ensureBucketExists = async () => {
    try {
      await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
      console.log(`✅ Bucket "${BUCKET_NAME}" already exists`);
    } catch (err: any) {
      if (err.statusCode === 404) {
        console.log(`ℹ️ Creating bucket "${BUCKET_NAME}"...`);
        await s3.createBucket({
          Bucket: BUCKET_NAME,
          ...(REGION === 'us-east-1' ? {} : {
            CreateBucketConfiguration: {
              LocationConstraint: REGION,
            }
          })
        }).promise();
        console.log(`✅ Bucket "${BUCKET_NAME}" created`);
      } else {
        throw new Error(`❌ Error checking bucket: ${err.message}`);
      }
    }
  };

  const downloadImage = async (url: string): Promise<Buffer> => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  };

  const uploadToS3 = async (buffer: Buffer, filename: string, contentType: string) => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `artist-images/${filename}`,
      Body: buffer,
      ContentType: contentType,
      //ACL: 'public-read'
    };
    await s3.putObject(params).promise();
    console.log(`✅ Uploaded ${filename}`);
  };

  await ensureBucketExists();

  const dataPath = path.join(process.cwd(), '2025a1.json');
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const songs = raw.songs;
  const seen = new Set<string>();

  for (const song of songs) {
    const url = song.img_url;
    if (seen.has(url)) continue;

    try {
      const buffer = await downloadImage(url);
      const ext = path.extname(url).split('?')[0];
      const fileName = path.basename(url).split('?')[0];
      const contentType = mime.lookup(ext) || 'image/jpeg';

      await uploadToS3(buffer, fileName, contentType);
      seen.add(url);
    } catch (err: any) {
      console.error(`❌ Failed for ${url}: ${err.message}`);
    }
  }

  console.log('🎉 All artist images uploaded.');
}
