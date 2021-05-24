/**
 * @file config.js
 * @description Configuration file
 */

// Libs
require('dotenv').config()

// Constants
const NO_SECRET_VALUE = 'nosecret'
const DEFAULT_APP_NAME = 'grocery-store-api'
// Environments
const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  TEST: 'test'
}

// Application
const APP_PROTOCOL = process.env.APP_PROTOCOL || 'http'
const APP_NAME = process.env.APP_NAME || DEFAULT_APP_NAME
const PORT = process.env.PORT || 4000
const APP_HOST = process.env.APP_HOST || 'localhost'
const APP_URL = `${APP_PROTOCOL}://${APP_HOST}:${PORT}`

// Authentication
const COOKIE_SECRET = process.env.COOKIE_SECRET || NO_SECRET_VALUE
const JWT_ISS = process.env.JWT_ISS || DEFAULT_APP_NAME
const TOKEN = {
  ACCESS: {
    EXPIRES_IN: process.env.TOKEN_ACCESS_EXP || '30m',
    SECRET: process.env.TOKEN_ACCESS_SECRET || NO_SECRET_VALUE,
    TYPE: 'TOKEN_TYPE_ACCESS'
  },
  ALGORITHM: 'HS512',
  JWT_ISS: process.env.JWT_ISS,
  REFRESH: {
    EXPIRES_IN: process.env.TOKEN_ACCESS_EXP || '60m',
    SECRET: process.env.TOKEN_REFRESH_SECRET || NO_SECRET_VALUE
  },
  RESET_PASSWORD: {
    EXPIRES_IN: process.env.TOKEN_RESET_PASSWORD_EXP || '4h',
    SECRET: process.env.TOKEN_RESET_PASSWORD_SECRET || NO_SECRET_VALUE,
    TYPE: 'TOKEN_TYPE_RESET_PASSWORD'
  }
}

 // Database configuration
const DATABASE = process.env.NODE_ENV === ENVIRONMENTS.TEST
  ? process.env.MONGODB_TEST_URI
  : process.env.MONGODB_URI

 /**
  * Check whether is development environment
  * @returns {Boolean} - Is development
  */
 const isDevelopment = () => {
   return process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT
 }

 module.exports = {
   APP_HOST,
   APP_NAME,
   APP_URL,
   COOKIE_SECRET,
   DATABASE,
   ENVIRONMENTS,
   JWT_ISS,
   PORT,
   TOKEN,
   isDevelopment
 }
