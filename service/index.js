const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const authCookieName = 'token';
app.use(cookieParser());

app.use(express.json());

let users = [];
let scores = [];

let apiRouter = express.Router();
app.use(`/api`, apiRouter);

const port = process.argv.length > 2 ? process.argv[2] : 3000;

apiRouter.post('/auth/create', async (req, res) => {
  const { email, password } = req.body;

  if (users.find(u => u.email === email)) {
    res.status(409).send({ msg: 'Existing user' });
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const token = uuid.v4();

  const user = { email, password: hashedPassword, token };
  users.push(user);

  // Set cookie
  res.cookie(authCookieName, token, { httpOnly: true });
  res.send({ email: user.email });
});

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
  res.cookie(authCookieName, user.token, { httpOnly: true });
  res.send({ email: user.email });
});

apiRouter.delete('/auth/logout', (req, res) => {
  const token = req.cookies[authCookieName];
  const user = users.find(u => u.token === token);

  if (user) {
    delete user.token;
  }

  res.clearCookie(authCookieName);
  res.status(204).end();
});

const verifyAuth = (req, res, next) => {
  const token = req.cookies[authCookieName];
  const user = users.find(u => u.token === token);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};


apiRouter.get('/habits', verifyAuth, (req, res) => {
  res.send(habits);
});

apiRouter.post('/habit', verifyAuth, (req, res) => {
  habits = updateHabits(req.body);
  res.send(habits);
});

function updateHabits(newHabit) {
  let found = false;
  for (const [i, existingHabit] of habits.entries()) {
    if (existingHabit.id === newHabit.id) {
      // Replace the existing habit with the updated one
      habits[i] = newHabit;
      found = true;
      break;
    }
  }

  if (!found) {
    habits.push(newHabit);
  }

  // Optional: limit to 20 habits
  if (habits.length > 20) {
    habits.length = 20;
  }

  return habits;
}