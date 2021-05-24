/**
 * @file auth.js
 * @description Authentication utils
 */

// Libs
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const _ = require('lodash')

// Utils
const errorCodes = require('./error-codes.utils')
const { TOKEN } = require('../config')
const AppError = require('./app-error.utils')

// Constants
const ROLES = {
  MANAGER: {
    NAME: 'Manager',
    CODE: 'MANAGER'
  },
  EMPLOYEE: {
    NAME: 'Employee',
    CODE: 'EMPLOYEE'
  }
}

/**
 * RBAC
 */
const RBAC = {
  CREATE_EMPLOYEE: 'create-employee',
  CREATE_MANAGER: 'create-manager',
  DELETE_EMPLOYEE: 'delete-employee',
  DELETE_MANAGER: 'delete-manager',
  READ_EMPLOYEE: 'read-employee',
  READ_MANAGER: 'read-manager',
  EMPLOYEES_LIST: 'employees-list',
  MANAGERS_LIST: 'managers-list',
  UPDATE_EMPLOYEE: 'update-employee',
  UPDATE_MANAGER: 'update-manager'
}

/**
 * Role ACL
 */
const ROLES_ACL = {
  [RBAC.CREATE_EMPLOYEE]: [
    ROLES.MANAGER.CODE
  ],
  [RBAC.CREATE_MANAGER]: [
    ROLES.MANAGER.CODE
  ],
  [RBAC.READ_EMPLOYEE]: [
    ROLES.EMPLOYEE.CODE,
    ROLES.MANAGER.CODE
  ],
  [RBAC.READ_MANAGER]: [
    ROLES.MANAGER.CODE
  ],
  [RBAC.UPDATE_EMPLOYEE]: [
    ROLES.MANAGER.CODE
  ],
  [RBAC.UPDATE_MANAGER]: [
    ROLES.MANAGER.CODE
  ],
  [RBAC.DELETE_MANAGER]: [
    ROLES.MANAGER.CODE
  ],
  [RBAC.DELETE_EMPLOYEE]: [
    ROLES.MANAGER.CODE
  ],
  [RBAC.EMPLOYEES_LIST]: [
    ROLES.MANAGER.CODE,
    ROLES.EMPLOYEE.CODE
  ],
  [RBAC.MANAGERS_LIST]: [
    ROLES.MANAGER.CODE,
    ROLES.EMPLOYEE.CODE
  ],
  [RBAC.STORE_MANAGERS]: [
    ROLES.MANAGER.CODE
  ],
  [RBAC.STORES_MANAGERS]: [
    ROLES.MANAGER.CODE
  ]
}

/**
 * Verify JWT token
 * @param {String} token - Authentication token
 * @param {String} secret - Secret string
 * @return {Promise} true/Error
 */
function jwtVerify(token, secret) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error, decoded) => {
      if (error) {
        if (error.name === 'TokenExpiredError') {
          return reject(new AppError({
            ...errorCodes.TOKEN_EXPIRED
          }))
        }
        return reject(new AppError({
          ...errorCodes.TOKEN_VERIFY,
          message: error.message
        }))
      }

      return resolve(decoded)
    })
  })
}

/**
 * Sign in with the JWT token
 * @param {Object} payload - Attributes
 * @param {String} secret - Secret string
 * @param {Object} options - Options
 * @return {Promise} string (token)
 */
function jwtSign(payload, secret, options = {}) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (error, token) => {
      if (error) {
        return reject(new AppError({
          ...errorCodes.TOKEN_NOT_SIGNED,
          message: error.message
        }))
      }
      return resolve(token)
    })
  })
}

/**
 * Make access token
 * @param {Object} userEntity - User
 * @return {Promise} string
 */
function makeAccessToken(userEntity) {
  if (!userEntity) {
    return null
  }

  const config = {
    payload: {
      tokenType: TOKEN.ACCESS.TYPE,
      name: userEntity.name,
      userRole: userEntity.role,
      username: userEntity.username,
      iss: TOKEN.JWT_ISS
    },

    options: {
      algorithm: TOKEN.ALGORITHM,
      subject: userEntity.id,
      expiresIn: TOKEN.ACCESS.EXPIRES_IN
    }
  }

  return jwtSign(config.payload, TOKEN.ACCESS.SECRET, config.options)
}

/**
 * Make password hash
 * @param {String} password - Password
 * @return {Promise} - String
 */
function makePasswordHash(password) {
  if (!password) {
    return ''
  }

  const salt = bcrypt.genSaltSync(10)

  return bcrypt.hashSync(password, salt)
}

/**
 * Check whether a user has permission for the action
 * @param {String} role - Role
 * @param {String} action - Action
 * @param {String} method - Route method
 * @returns {Boolean} - Has permission
 */
async function hasPermission(role, action) {
  if (!_.includes(role.acl, action)) {
    return false
  }

  return true
}

module.exports = {
  RBAC,
  ROLES,
  ROLES_ACL,
  hasPermission,
  jwtSign,
  jwtVerify,
  makeAccessToken,
  makePasswordHash
}
