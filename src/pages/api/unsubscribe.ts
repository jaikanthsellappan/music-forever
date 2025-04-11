import type { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";

AWS.config.update({ region: "us-east-1" });
const docClient = new AWS.DynamoDB.DocumentClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") return res.status(405).end();

  const { email, song } = req.body;

  const params = {
    TableName: "subscriptions",
    Key: {
      email: email,
      title: song.title // assuming title is sort key
    }
  };

  try {
    await docClient.delete(params).promise();
    res.status(200).json({ message: "Unsubscribed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unsubscribe." });
  }
}
