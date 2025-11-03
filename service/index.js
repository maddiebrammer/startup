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

// POST /auth/create - register a new user
apiRouter.post('/auth/create', async (req, res) => {
  const { email, password } = req.body;

  // Check for existing user
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

// POST /auth/login - authenticate existing user
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

  // Generate and set new token
  user.token = uuid.v4();
  res.cookie(authCookieName, user.token, { httpOnly: true });
  res.send({ email: user.email });
});

// DELETE /auth/logout - log out current user
apiRouter.delete('/auth/logout', (req, res) => {
  const token = req.cookies[authCookieName];
  const user = users.find(u => u.token === token);

  if (user) {
    delete user.token;
  }

  res.clearCookie(authCookieName);
  res.status(204).end();
});
