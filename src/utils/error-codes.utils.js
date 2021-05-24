/**
 * @file error-codes.utils.js
 * @description Errors used in application
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

module.exports = {
  SERVER: {
    description: 'Server error occurred',
    status: 500,
    code: 'SERVER_ERROR'
  },
  BAD_REQUEST: {
    description: 'Bad request',
    status: 400,
    code: 'BAD_REQUEST_ERROR'
  }, // hacker tryout case errors
  FORBIDDEN: {
    description: 'Access forbidden',
    status: 403,
    code: 'FORBIDDEN_ERROR'
  },
  NO_ANONYMOUS_ACCESS: {
    description: 'Access denied. No anonymous access',
    status: 403,
    code: 'NO_ANONYMOUS_ACCESS_ERROR'
  },
  BAD_ROLE: {
    description: 'Bad role',
    status: 403,
    code: 'BAD_ROLE_ERROR'
  },
  INVALID_CREDENTIALS: {
    description: 'Invalid credentials',
    status: 403,
    code: 'INVALID_CREDENTIALS_ERROR'
  },
  TOKEN_EXPIRED: {
    description: 'Token expired',
    status: 419,
    code: 'TOKEN_EXPIRED_ERROR'
  },
  TOKEN_VERIFY: {
    description: 'Token verify error',
    status: 401,
    code: 'TOKEN_VERIFY_ERROR'
  },
  ROUTE_NOT_FOUND: {
    description: 'Route not found',
    status: 404,
    code: 'ROUTE_NOT_FOUND'
  },
  UNPROCESSABLE_ENTITY: {
    description: 'Unprocessable entity',
    status: 422,
    code: 'UNPROCESSABLE_ENTITY'
  },
  AUTHENTICATION_FAILED: {
    description: 'You must be logged in',
    status: 401,
    code: 'AUTHENTICATION_FAILED'
  },
  STORE_FORBIDDEN: {
    description: 'You don\'t have permission for this store',
    message: 'You don\'t have permission for this store',
    status: 403,
    code: 'STORE_FORBIDDEN'
  }
}
