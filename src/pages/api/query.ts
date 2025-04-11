import type { NextApiRequest, NextApiResponse } from "next";
import AWS from "aws-sdk";

AWS.config.update({ region: "us-east-1" });
const docClient = new AWS.DynamoDB.DocumentClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { title, artist, album, year } = req.body;
  const params = {
    TableName: "music",
  };

  try {
    const data = await docClient.scan(params).promise();
    const filtered = (data.Items || []).filter((item: any) => {
      return (
        (!title || item.title.toLowerCase().includes(title.toLowerCase())) &&
        (!artist || item.artist.toLowerCase().includes(artist.toLowerCase())) &&
        (!album || item.album.toLowerCase().includes(album.toLowerCase())) &&
        (!year || item.year === year)
      );
    });

    res.status(200).json({ results: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed." });
  }
}
