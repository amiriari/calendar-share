//load environment variables first, before anything else runs
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users')
const eventsRouter = require('./routes/events')
const friendshipsRouter = require('./routes/friendships')

//create server ->app object is attached to everything we do with express
const app = express();
const PORT = process.env.PORT || 3001;

//middleware, runs on every single request before reaching route handlers
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/users', usersRouter)
app.use('/events', eventsRouter)
app.use('/friendships', friendshipsRouter)


//start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});