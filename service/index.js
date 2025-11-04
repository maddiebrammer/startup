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

let users = []; // Each user stores their own habits

const apiRouter = express.Router();
app.use('/api', apiRouter);

const port = process.argv.length > 2 ? process.argv[2] : 3000;

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

// ===============================
// ERROR HANDLER & DEFAULT ROUTE
// ===============================
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

app.get('*', (_req, res) => {
  res.send({ msg: 'NDGE Habit Tracker service running' });
});

// ===============================
// SERVER START
// ===============================
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
