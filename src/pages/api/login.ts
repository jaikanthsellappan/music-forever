import type { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';

// Setup AWS credentials and region
const credentials = new AWS.SharedIniFileCredentials({ profile: 'student' });
AWS.config.credentials = credentials;
AWS.config.update({ region: 'us-east-1' });

// Initialize DynamoDB client
const docClient = new AWS.DynamoDB.DocumentClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Fetch user from DynamoDB
    const result = await docClient.get({
      TableName: 'login',
      Key: { email },
    }).promise();

    const user = result.Item;

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Email or password is invalid' });
    }

    // ✅ Success: send username along with response
    res.status(200).json({ 
      message: 'Login successful',
      username: user.user_name
    });

  } catch (error: any) {
    // Handle unexpected errors
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
