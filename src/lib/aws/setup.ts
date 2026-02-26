import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

// AWS SDK Configuration
// const credentials = new AWS.SharedIniFileCredentials({ profile: 'student' });
// AWS.config.credentials = credentials;
// Ensure AWS loads config from ~/.aws/config and ~/.aws/credentials
process.env.AWS_SDK_LOAD_CONFIG = '1';

AWS.config.update({ region: 'us-east-1' });

const dynamo = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

// Initialize music table and load songs from JSON
export async function initializeDatabase() {
  const tableName = 'music';

  try {
    await dynamo.describeTable({ TableName: tableName }).promise();
    console.log('Music table already exists');
    return;
  } catch (err: any) {
    if (err.code !== 'ResourceNotFoundException') {
      console.error('Error checking music table:', err);
      return;
    }
  }

  await dynamo.createTable({
    TableName: tableName,
    KeySchema: [{ AttributeName: 'title', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'title', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
  }).promise();
  console.log('Music table created');

  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for activation

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
  console.log('Music data loaded into table');
}

// Initialize login table with 10 users
export async function initializeLoginTable() {
  const tableName = 'login';

  try {
    await dynamo.describeTable({ TableName: tableName }).promise();
    console.log('Login table already exists');
    return;
  } catch (err: any) {
    if (err.code !== 'ResourceNotFoundException') {
      console.error('Error checking login table:', err);
      return;
    }
  }

  await dynamo.createTable({
    TableName: tableName,
    KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
  }).promise();
  console.log('Login table created');

  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for activation

  const logins = [
    { email: 's40606430@student.rmit.edu.au', user_name: 'RishekeshB0', password: '012345' },
    { email: 's40768781@student.rmit.edu.au', user_name: 'MuraliDevendran1', password: '123456' },
    { email: 's40533912@student.rmit.edu.au', user_name: 'NaveenbalajiMailasamy2', password: '234567' },
    { email: 's40626913@student.rmit.edu.au', user_name: 'JaikanthSellappan3', password: '345678' },
    { email: 's99999994@student.rmit.edu.au', user_name: 'Student4', password: '456789' },
    { email: 's99999995@student.rmit.edu.au', user_name: 'Student5', password: '567890' },
    { email: 's99999996@student.rmit.edu.au', user_name: 'Student6', password: '678901' },
    { email: 's99999997@student.rmit.edu.au', user_name: 'Student7', password: '789012' },
    { email: 's99999998@student.rmit.edu.au', user_name: 'Student8', password: '890123' },
    { email: 's99999999@student.rmit.edu.au', user_name: 'Student9', password: '901234' },
  ];

  const promises = logins.map(user =>
    docClient.put({
      TableName: tableName,
      Item: user
    }).promise()
  );

  await Promise.all(promises);
  console.log('Login data loaded into table');
}

// Call this when you want to initialize the login table
initializeLoginTable()
  .then(() => console.log(' Login table setup complete'))
  .catch(err => console.error(' Error setting up login table:', err));
