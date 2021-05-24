/**
 * @file rbac.middleware.js
 * @description RBAC middleware
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Utils
const AppError = require('../utils/app-error.utils')
const { hasPermission } = require('../utils/auth.utils')
const errorCodes = require('../utils/error-codes.utils')

module.exports = (action) => {
  return async (req, res, next) => {
    const { currentUser: { _doc: currentUser } = {} } = req

    if (!currentUser._id) {
      throw new AppError({
        ...errorCodes.AUTHENTICATION_FAILED
      })
    }

    // check user permissions
    const canAccess = await hasPermission(currentUser.role, action)

    if (!canAccess) {
      next(
        new AppError({
          ...errorCodes.FORBIDDEN
        })
      )
    }

    next()
  }
}
