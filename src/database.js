/**
 * @file database.js
 * @description Database connection
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

const mongoose = require('mongoose')
const { DATABASE } = require('./config')

mongoose.connect(DATABASE, {
  keepAlive: 1,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
})

// Import models
require('./models')

module.exports = mongoose
