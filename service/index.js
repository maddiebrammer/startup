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
const port = process.env.PORT || 4000;

app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

// ===============================
// AUTH ENDPOINTS
// ===============================

// Create new user
apiRouter.post('/auth/create', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await db.getUser(email);
    if (existingUser) {
      return res.status(409).send({ msg: 'Existing user' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = uuid.v4();
    const name = email.includes('@') ? email.split('@')[0] : email;

    const user = { email, name, password: hashedPassword, token, habits: [] };
    await db.addUser(user);
    await db.updateScore(email, name, 0); // initialize score

    res.cookie(authCookieName, token, { httpOnly: true });
    res.send({ email });
  } catch (err) {
    res.status(500).send({ type: err.name, message: err.message });
  }
});

// Login existing user
apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.getUser(email);
    if (!user) return res.status(401).send({ msg: 'Unauthorized' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).send({ msg: 'Unauthorized' });

    user.token = uuid.v4();
    await db.updateUser(user);

    res.cookie(authCookieName, user.token, { httpOnly: true, sameSite: 'strict' });
    res.send({ email: user.email });
  } catch (err) {
    res.status(500).send({ type: err.name, message: err.message });
  }
});

// Logout user
apiRouter.delete('/auth/logout', async (req, res) => {
  try {
    const token = req.cookies[authCookieName];
    const user = await db.getUserByToken(token);

    if (user) {
      delete user.token;
      await db.updateUser(user);
    }

    res.clearCookie(authCookieName);
    res.status(204).end();
  } catch (err) {
    res.status(500).send({ type: err.name, message: err.message });
  }
});

// ===============================
// AUTH MIDDLEWARE
// ===============================
async function verifyAuth(req, res, next) {
  try {
    const token = req.cookies[authCookieName];
    const user = await db.getUserByToken(token);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).send({ msg: 'Unauthorized' });
    }
  } catch (err) {
    res.status(500).send({ type: err.name, message: err.message });
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
// HELPER FUNCTIONS
// ===============================
function updateHabits(existingHabits, newHabit) {
  const idx = existingHabits.findIndex(h => h.id === newHabit.id);
  if (idx >= 0) existingHabits[idx] = newHabit;
  else existingHabits.push(newHabit);

  if (existingHabits.length > 20) existingHabits.length = 20;
  return existingHabits;
}

// ===============================
// SCORES ENDPOINTS
// ===============================
apiRouter.get('/scores', verifyAuth, async (_req, res) => {
  try {
    const scores = await db.getScores();
    res.send(scores);
  } catch (err) {
    res.status(500).send({ type: err.name, message: err.message });
  }
});

apiRouter.post('/score', verifyAuth, async (req, res) => {
  try {
    const user = req.user;
    const completed = (user.habits || []).filter(h => h.done).length;
    const displayName = user.name || user.email.split('@')[0] || 'Unknown';
    const updatedScores = await db.updateScore(user.email, displayName, completed);
    res.status(200).send(updatedScores);
  } catch (err) {
    res.status(500).send({ type: err.name, message: err.message });
  }
});

// ===============================
// ERROR HANDLER & DEFAULT ROUTE
// ===============================

// Verify user session
apiRouter.get('/auth/verify', async (req, res) => {
  try {
    const token = req.cookies[authCookieName];
    const user = await db.getUserByToken(token);
    if (user) {
      res.status(200).send({ email: user.email });
    } else {
      res.status(401).send({ msg: 'Unauthorized' });
    }
  } catch (err) {
    res.status(500).send({ type: err.name, message: err.message });
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// ===============================
// SERVER START
// ===============================
app.use((err, req, res, next) => {
  res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

async function startServer() {
  try {
    await db.connectDB(); 
    app.listen(port, () => {
      console.log(`🚀 Listening on port ${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

startServer();
