import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';


// Tell SDK to use the 'student' profile
const credentials = new AWS.SharedIniFileCredentials({ profile: 'student' });
AWS.config.credentials = credentials;
AWS.config.update({ region: 'us-east-1' });
const dynamo = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

export async function initializeDatabase() {
  const tableName = 'music';

  // 1. Check if table exists
  try {
    await dynamo.describeTable({ TableName: tableName }).promise();
    console.log('✅ Table already exists');
    return;
  } catch (err: any) {
    if (err.code !== 'ResourceNotFoundException') {
      console.error('❌ Error checking table:', err);
      return;
    }
  }

  // 2. Create the table
  await dynamo.createTable({
    TableName: tableName,
    KeySchema: [{ AttributeName: 'title', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'title', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
  }).promise();
  console.log('✅ Table created');

  // Wait a few seconds for the table to be active
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // 3. Load data from JSON
  const dataPath = path.join(process.cwd(), '2025a1.json');
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const songs = raw.songs;

  const promises = songs.map((song: any) =>
    docClient.put({
      TableName: tableName,
      Item: {
        title: song.title,
        artist: song.artist,
        year: song.year,
        album: song.album,
        image_url: song.img_url,
      }
    }).promise()
  );

  await Promise.all(promises);
  console.log('✅ Music data loaded into table');
}
