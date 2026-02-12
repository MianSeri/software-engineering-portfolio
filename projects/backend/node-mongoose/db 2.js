const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI);

async function connect() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db("sample_mflix"); 
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

module.exports = connect;