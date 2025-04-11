import type { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';

const credentials = new AWS.SharedIniFileCredentials({ profile: 'student' });
AWS.config.credentials = credentials;
AWS.config.update({ region: 'us-east-1' });

const docClient = new AWS.DynamoDB.DocumentClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;

  try {
    const result = await docClient.get({
      TableName: 'login',
      Key: { email }
    }).promise();

    if (!result.Item || result.Item.password !== password) {
      return res.status(401).json({ error: 'Email or password is invalid' });
    }

    // ✅ Send username in response
    res.status(200).json({ 
      message: 'Login successful',
      username: result.Item.user_name
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
