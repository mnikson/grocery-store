/**
 * @file index.js
 * @description Auth routes
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Routes
const {
  loginRoute,
  // signUpRoute
} = require('./auth.router.js')

// Middleware
const authMiddleware = require('../../middlewares/auth.middleware')

// Utils
const APP_ROUTES = require('../../utils/route-constants.utils')

module.exports = (router) => {
  /**
   * Login
   */
  router.post(APP_ROUTES.LOGIN, loginRoute)

  /**
   * Sign Up
   */
  // router.post(APP_ROUTES.REGISTER, aclMiddleware, signUpRoute)
}
