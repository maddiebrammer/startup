// ===============================
// NDGE Habit Tracker Service
// ===============================
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const authCookieName = 'token';

app.use(cookieParser());
app.use(express.json());

app.use(express.static('public'));

let users = []; // Each user stores their own habits

const apiRouter = express.Router();
app.use('/api', apiRouter);

const port = process.argv.length > 2 ? process.argv[2] : 4000;

// ===============================
// AUTH ENDPOINTS
// ===============================

// Create new user
apiRouter.post('/auth/create', async (req, res) => {
  const { email, password } = req.body;

  if (users.find(u => u.email === email)) {
    res.status(409).send({ msg: 'Existing user' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const token = uuid.v4();

  const user = {
    email,
    password: hashedPassword,
    token,
    habits: [],
  };

  users.push(user);

  res.cookie(authCookieName, token, { httpOnly: true, sameSite: 'strict' });
  res.send({ email: user.email });
});

// Login existing user
apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
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
  res.cookie(authCookieName, user.token, { httpOnly: true, sameSite: 'strict' });
  res.send({ email: user.email });
});

// Logout user
apiRouter.delete('/auth/logout', (req, res) => {
  const token = req.cookies[authCookieName];
  const user = users.find(u => u.token === token);

  if (user) {
    delete user.token;
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
  habits = habits.filter((habit) => habit.id !== id);
  res.send(habits); // return updated habits list
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
function updateScores(userEmail, userName) {
  // Count completed habits for this user
  const completedCount = habits.filter(h => h.user === userEmail && h.done).length;

  // Find existing score entry
  const existingScore = scores.find(s => s.user === userEmail);
  if (existingScore) {
    existingScore.score = completedCount;
    existingScore.name = userName; // ensure frontend name is up-to-date
  } else {
    scores.push({ user: userEmail, name: userName, score: completedCount });
  }

  // Sort descending by score
  scores.sort((a, b) => b.score - a.score);

  // Optional: limit leaderboard to top 10
  if (scores.length > 10) scores.length = 10;

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

  // Update the score using the helper function
  const updatedScores = updateScores(user.email, user.email); // or user.name if you have it
  res.send(updatedScores);
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
