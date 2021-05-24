/**
 * @file constants.js
 * @description Application constants
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Verification rules
const RULES = {
  EMAIL: 'email',
  REQUIRED: 'required',
  UNIQUE_EMAIL: 'unique_email',
  PASSWORD: 'password'
}

const PAGINATION = {
  LIMIT: 25,
  PAGE: 1
}

/**
 * Password rules
 */
const PASSWORD_RULES = {
  MIN: 6,
  MAX: 16,
  MESSAGE:
    `Must be between ${6}-${16} characters, ` +
    'have at least one capital letter, ' +
    'one lowercase letter, one digit, ' +
    'and one special character',
  REGEXP: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
}

// Collections
const COLLECTION_NAMES = {
  ROLES: 'roles',
  STORES: 'stores',
  USERS: 'users'
}

module.exports = {
  COLLECTION_NAMES,
  PAGINATION,
  PASSWORD_RULES,
  RULES
}
