/**
 * @file index.js
 * @description Middleware main file
 */

const authMiddleware = require('./auth.middleware')
const rbacMiddleware = require('./rbac.middleware')

module.exports = {
  authMiddleware,
  rbacMiddleware
}
