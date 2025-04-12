import type { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';

// const credentials = new AWS.SharedIniFileCredentials({ profile: 'student' });
// AWS.config.credentials = credentials;
// Ensure AWS loads config from ~/.aws/config and ~/.aws/credentials
process.env.AWS_SDK_LOAD_CONFIG = '1';

AWS.config.update({ region: 'us-east-1' });

const docClient = new AWS.DynamoDB.DocumentClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, song } = req.body;

  if (!email || !song || !song.title) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const params = {
    TableName: 'subscriptions',
    Item: {
      email,
      title: song.title,
      artist: song.artist,
      album: song.album,
      year: song.year,
      image_url: song.image_url,
    },
  };

  try {
    await docClient.put(params).promise();
    res.status(200).json({ message: 'Subscribed successfully' });
  } catch (error: any) {
    console.error("Subscribe error:", error);
    res.status(500).json({ error: 'Subscription failed', details: error.message });
  }
}
