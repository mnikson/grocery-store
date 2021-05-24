/**
 * @file app.js
 * @description Application main file
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Libs
const express = require('express')
const cors = require('cors')

// Constants
const { REQUEST_LIMIT } = require('./utils/constants')
const { ENVIRONMENTS } = require('./config')

// Connect to database
require('../src/database')

// Routes
const routes = require('./routes')

// App initialization
const app = express()

// Parsers
app.use(express.json({ limit: REQUEST_LIMIT }))
app.use(express.urlencoded({
  extended: false,
  limit: REQUEST_LIMIT
}))

app.disable('x-powered-by')
app.use(cors({
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
}))

// Routes
app.use(routes)
// Not found
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handling
app.use((err, req, res, next) => {
  // Show log but for the test environment
  if (process.env.NODE_ENV !== ENVIRONMENTS.TEST) {
    console.log(err)
  }
  const status = err.status || 500
  res.status(status).json(err);
});

module.exports = app
