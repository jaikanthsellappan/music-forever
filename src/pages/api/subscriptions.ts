import type { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";

AWS.config.update({ region: "us-east-1" }); // Change region if needed
const docClient = new AWS.DynamoDB.DocumentClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;

  const params = {
    TableName: "subscriptions",
    KeyConditionExpression: "email = :e",
    ExpressionAttributeValues: { ":e": email }
  };

  try {
    const data = await docClient.query(params).promise();
    res.status(200).json({ subscriptions: data.Items || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch subscriptions." });
  }
}
