// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { initializeDatabase } from '@/lib/aws/setup';
import { uploadArtistImages } from '@/lib/aws/upload-images';

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await initializeDatabase(); // Creates + populates music table
    await uploadArtistImages(); // Downloads + uploads images to S3

    res.status(200).json({ message: 'Database initialized and images uploaded' });
  } catch (err: any) {
    console.error(' Initialization error:', err.message);
    res.status(500).json({ error: 'Initialization failed' });
  }
}
