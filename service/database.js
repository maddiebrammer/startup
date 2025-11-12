const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);

let db, usersCollection, scoresCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('ndge');
    usersCollection = db.collection('user');
    scoresCollection = db.collection('scores');
    console.log('Connected to MongoDB');
  } catch (ex) {
    console.error(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
}

// -------------------------------
// USER FUNCTIONS
// -------------------------------
async function getUser(email) {
  return usersCollection.findOne({ email });
}

async function getUserByToken(token) {
  return usersCollection.findOne({ token });
}

async function addUser(user) {
  await usersCollection.insertOne(user);
}

async function updateUser(user) {
  await usersCollection.updateOne({ email: user.email }, { $set: user });
}

// -------------------------------
// SCORE FUNCTIONS
// -------------------------------
async function getScores() {
  return scoresCollection.find().sort({ score: -1 }).toArray();
}

async function updateScore(userEmail, displayName, scoreValue) {
  await scoresCollection.updateOne(
    { user: userEmail },
    { $set: { name: displayName, score: scoreValue } },
    { upsert: true }
  );
  return getScores();
}

module.exports = {
  connectDB,
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  getScores,
  updateScore,
};
