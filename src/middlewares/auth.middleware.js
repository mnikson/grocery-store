/**
 * @file auth.middleware.js
 * @description Authentication middleware
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Libs
const mongoose = require('mongoose')

// Utils
const errorCodes = require('../utils/error-codes.utils')
const { jwtVerify } = require('../utils/auth.utils')
const AppError = require('../utils/app-error.utils')

// Constants
const { TOKEN: { ACCESS } } = require('../config')
const { COLLECTION_NAMES } = require('../utils/constants')

// Models
const User = mongoose.model(COLLECTION_NAMES.USERS);


module.exports = async (req, res, next) => {
  const authorization = req.headers.authorization || req.headers.Authorization
  const bearer = authorization && authorization.startsWith('Bearer ') ? authorization : null
  const token = bearer ? bearer.split('Bearer ')[1] : null

  if (!token) {
    const { status, description } = errorCodes.AUTHENTICATION_FAILED
    return res.status(status).json({
      message: description
    })
  }
  try {
    const tokenData = await jwtVerify(token, ACCESS.SECRET)

    if (!tokenData) {
      return next(new AppError(errorCodes.TOKEN_VERIFY))
    }

    // find a user from token
    const user = await User.findById(tokenData.sub)
      .populate('role')
      .populate('store')

    if (user) {
      // set actual current user
      req.currentUser = Object.freeze({
        ...user
      })

      req.decoded = tokenData

      return next()
    } else {
      const authError = new AppError({
        ...errorCodes.AUTHENTICATION_FAILED
      })

      return next(authError)
    }
  } catch (error) {
    next(new Error(error.message))
  }
}
