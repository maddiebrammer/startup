// ===============================
// NDGE Habit Tracker Service with MongoDB
// ===============================
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const db = require('./database');

const app = express();
const authCookieName = 'token';

app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

const port = process.argv.length > 2 ? process.argv[2] : 4000;

// ===============================
// AUTH ENDPOINTS
// ===============================

// Create new user
apiRouter.post('/auth/create', async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await db.getUser(email);
  if (existingUser) {
    res.status(409).send({ msg: 'Existing user' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const token = uuid.v4();
  const name = email.includes('@') ? email.split('@')[0] : email;

  const user = { email, name, password: hashedPassword, token, habits: [] };
  await db.addUser(user);
  await db.updateScore(email, name, 0); // initialize score

  res.cookie(authCookieName, token, { httpOnly: true });
  res.send({ email });
});


// Login existing user
apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.getUser(email);

  if (!user) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }

  user.token = uuid.v4();
  await db.updateUser(user);

  res.cookie(authCookieName, user.token, { httpOnly: true, sameSite: 'strict' });
  res.send({ email: user.email });
});

// Logout user
apiRouter.delete('/auth/logout', async (req, res) => {
  const token = req.cookies[authCookieName];
  const user = await db.getUserByToken(token);

  if (user) {
    delete user.token;
    await db.updateUser(user);
  }

  res.clearCookie(authCookieName);
  res.status(204).end();
});

// ===============================
// AUTH MIDDLEWARE
// ===============================
const verifyAuth = (req, res, next) => {
  const token = req.cookies[authCookieName];
  const user = users.find(u => u.token === token);
  if (user) {
    req.user = user; // attach user to request
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// ===============================
// HABITS ENDPOINTS
// ===============================

// Get all habits for logged-in user
apiRouter.get('/habits', verifyAuth, (req, res) => {
  res.send(req.user.habits);
});

// Add or update a habit
apiRouter.post('/habit', verifyAuth, (req, res) => {
  const newHabit = req.body;
  req.user.habits = updateHabits(req.user.habits, newHabit);
  res.send(req.user.habits);
});

// DELETE a habit
apiRouter.delete('/habit', verifyAuth, (req, res) => {
  const { id } = req.body; // expect JSON body with { id }
  req.user.habits = req.user.habits.filter((habit) => habit.id !== id);
  res.send(req.user.habits);
});


// ===============================
// HELPER FUNCTIONS
// ===============================

function updateHabits(existingHabits, newHabit) {
  let found = false;
  for (const [i, existingHabit] of existingHabits.entries()) {
    if (existingHabit.id === newHabit.id) {
      existingHabits[i] = newHabit; // update
      found = true;
      break;
    }
  }

  if (!found) {
    existingHabits.push(newHabit);
  }

  // limit habits to 20 per user
  if (existingHabits.length > 20) {
    existingHabits.length = 20;
  }

  return existingHabits;
}

/* -------------------------------
   Scores / Leaderboard Endpoints
--------------------------------*/
// Update scores based on completed habits for a user
function updateScores(userEmail) {
  const user = users.find(u => u.email === userEmail);
  if (!user) return scores;

  const completed = user.habits.filter(h => h.done).length;
  const existingScore = scores.find(s => s.user === userEmail);

  // Use the user's real name, or a fallback
  const displayName = user.name || user.email.split('@')[0] || 'Unknown';

  if (existingScore) {
    existingScore.score = completed;
    existingScore.name = displayName;
  } else {
    scores.push({
      user: userEmail,
      name: displayName,
      score: completed,
    });
  }
  console.log('SCORES ARRAY:', scores);

  scores.sort((a, b) => b.score - a.score);
  return scores;
}


apiRouter.get('/scores', verifyAuth, (_req, res) => {
  res.send(scores);
});

// Update a user's score based on their completed habits
apiRouter.post('/score', verifyAuth, (req, res) => {
  const token = req.cookies[authCookieName];
  const user = users.find(u => u.token === token);

  if (!user) {
    return res.status(401).send({ msg: 'Unauthorized' });
  }

  const updatedScores = updateScores(user.email);
  res.status(200).send(updatedScores);
});



// ===============================
// ERROR HANDLER & DEFAULT ROUTE
// ===============================
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// ===============================
// SERVER START
// ===============================
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
