// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { initializeDatabase } from '@/lib/aws/setup';

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  await initializeDatabase(); // Runs only once if table doesn't exist
  res.status(200).json({ message: 'App initialized' });
}
