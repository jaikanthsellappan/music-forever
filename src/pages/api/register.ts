import type { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';

const credentials = new AWS.SharedIniFileCredentials({ profile: 'student' });
AWS.config.credentials = credentials;
AWS.config.update({ region: 'us-east-1' });

const docClient = new AWS.DynamoDB.DocumentClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, username, password } = req.body;

  try {
    // 1. Check if email already exists
    const existing = await docClient.get({
      TableName: 'login',
      Key: { email }
    }).promise();

    if (existing.Item) {
      return res.status(400).json({ error: 'The email already exists' });
    }

    // 2. Create new user
    await docClient.put({
      TableName: 'login',
      Item: {
        email,
        user_name: username,
        password
      }
    }).promise();

    res.status(200).json({ message: 'Registered successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
