/**
 * Router index file
 */

// Libs
const express = require('express')

// Utils
const APP_ROUTES = require('../utils/route-constants.utils')

// Constants
const router = express.Router()

// Routes
require('./auth.router')(router)
require('./user.router')(router)
require('./store.router')(router)

router.get(APP_ROUTES.ROOT, (req, res) => {
  res.send({
    success: true,
    message: 'The app is ready'
  })
})

module.exports = router
