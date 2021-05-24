/**
 * @file index.js
 * @description Store routes
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Routes
const {
  storeEmployeesList,
  storeAndDescEmployeesList,
  storeManagersList,
  storeAndDescManagersList
} = require('./store.router.js')

// Middleware
const { authMiddleware, rbacMiddleware } = require('../../middlewares')

// Utils
const APP_ROUTES = require('../../utils/route-constants.utils')
const { RBAC } = require('../../utils/auth.utils.js')

module.exports = (router) => {

  /**
   * Store employees
   */
  router.get(APP_ROUTES.STORE_EMPLOYEES_LIST,
    authMiddleware, rbacMiddleware(RBAC.EMPLOYEES_LIST), storeEmployeesList)

  /**
   * Store and descendant stores employees
   */
  router.get(APP_ROUTES.STORES_EMPLOYEES_LIST,
    authMiddleware, rbacMiddleware(RBAC.EMPLOYEES_LIST), storeAndDescEmployeesList)

  /**
   * Store managers
   */
   router.get(APP_ROUTES.STORE_MANAGERS_LIST,
    authMiddleware, rbacMiddleware(RBAC.MANAGERS_LIST), storeManagersList)

  /**
   * Store and descendant stores managers
   */
  router.get(APP_ROUTES.STORES_MANAGERS_LIST,
    authMiddleware, rbacMiddleware(RBAC.MANAGERS_LIST), storeAndDescManagersList)

}
