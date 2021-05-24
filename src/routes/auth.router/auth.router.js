/* eslint-disable camelcase */
/**
 * @file auth.router.js
 * @description Authentication routes
 */

// Libs
const AppError = require('../../utils/app-error.utils')
const errorCodesUtils = require('../../utils/error-codes.utils')

// Handlers
const { userHandler } = require('../../handlers')

/**
 * Login route
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @returns {void}
 */
async function loginRoute(req, res, next) {
  try {
    const { username, password } = req.body

    if (!(username || password)) {
      throw new AppError({
        ...errorCodesUtils.BAD_REQUEST,
        message: 'Username and passwords are required'
      })
    }

    const user = await userHandler.loginUser(username, password)

    res.json({
      data: user.toObject()
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Register user
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @returns {void}
 */
const signUpRoute = async (req, res, next) => {
  try {
    const {
      username,
      name,
      password,
      role,
      store
    } = req.body

    if (!(username || name || password || store)) {
      throw new AppError({
        ...errorCodesUtils.BAD_REQUEST,
        message: 'Insert mandatory fields'
      })
    }

    const data = await userHandler.signUpUser({
      name,
      username,
      password,
      role,
      store
    })

    return res.send({ data })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  loginRoute,
  signUpRoute
}
