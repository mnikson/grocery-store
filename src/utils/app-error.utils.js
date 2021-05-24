/**
 * @file app-error.utils
 * @description Application error utils
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

/**
 * Application Error
 * @param {Object} options - Options
 * @returns {void}
 */
 function AppError(options = {}) {
  if (!options || !options.description) {
    throw new Error('description param required')
  }

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor)
  }

  this.description = options.description || undefined // default error description from errorCodes
  this.message = options.message || this.description // message thrown by error
  this.status = options.status || 500
  this.code = options.code || 'UNEXPECTED_ERROR'
  this.errorCode = options.code || 'UNEXPECTED_ERROR'
  this.layer = options.layer || undefined
  this.meta = options.meta || undefined
  this.req = options.req || undefined
  this.origin = options.origin || undefined // origin error data
}

module.exports = AppError
