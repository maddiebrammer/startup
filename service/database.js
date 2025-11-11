const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('ndge');
const usersCollection = db.collection('user');
const scoresCollection = db.collection('scores');

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`Connect to database`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

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
  const allScores = await getScores();
  return allScores;
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  getScores,
  updateScore,
};