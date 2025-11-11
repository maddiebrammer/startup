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
async function verifyAuth(req, res, next) {
  const token = req.cookies[authCookieName];
  const user = await db.getUserByToken(token);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
}

// ===============================
// HABITS ENDPOINTS
// ===============================
apiRouter.get('/habits', verifyAuth, async (req, res) => {
  res.send(req.user.habits || []);
});

apiRouter.post('/habit', verifyAuth, async (req, res) => {
  const newHabit = req.body;
  req.user.habits = updateHabits(req.user.habits || [], newHabit);
  await db.updateUser(req.user);
  res.send(req.user.habits);
});

apiRouter.delete('/habit', verifyAuth, async (req, res) => {
  const { id } = req.body;
  req.user.habits = (req.user.habits || []).filter(h => h.id !== id);
  await db.updateUser(req.user);
  res.send(req.user.habits);
});


// ===============================
// SCORES ENDPOINTS
// ===============================
function updateHabits(existingHabits, newHabit) {
  const idx = existingHabits.findIndex(h => h.id === newHabit.id);
  if (idx >= 0) existingHabits[idx] = newHabit;
  else existingHabits.push(newHabit);

  if (existingHabits.length > 20) existingHabits.length = 20;
  return existingHabits;
}

apiRouter.get('/scores', verifyAuth, async (_req, res) => {
  const scores = await db.getScores();
  res.send(scores);
});

apiRouter.post('/score', verifyAuth, async (req, res) => {
  const user = req.user;
  const completed = (user.habits || []).filter(h => h.done).length;
  const displayName = user.name || user.email.split('@')[0] || 'Unknown';
  const updatedScores = await db.updateScore(user.email, displayName, completed);
  res.status(200).send(updatedScores);
});

// ===============================
// ERROR HANDLER & DEFAULT ROUTE
// ===============================
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
