/**
 * @file index.js
 * @description User routes
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Routes
const {
  createEmployee,
  createManager,
  deleteEmployee,
  deleteManager,
  readEmployee,
  readManager,
  updateEmployee,
  updateManager
} = require('./user.router.js')

// Middleware
const { authMiddleware, rbacMiddleware } = require('../../middlewares')

// Utils
const APP_ROUTES = require('../../utils/route-constants.utils')
const { RBAC } = require('../../utils/auth.utils.js')

module.exports = (router) => {
  /**
   * Create an employee
   */
  router.post(APP_ROUTES.EMPLOYEE,
    authMiddleware, rbacMiddleware(RBAC.CREATE_EMPLOYEE), createEmployee)

  /**
   * Update an employee
   */
   router.put(`${APP_ROUTES.EMPLOYEE}/:id`,
    authMiddleware, rbacMiddleware(RBAC.UPDATE_EMPLOYEE), updateEmployee)

  /**
   * Get an employee
   */
   router.get(`${APP_ROUTES.EMPLOYEE}/:id`,
    authMiddleware, rbacMiddleware(RBAC.READ_EMPLOYEE), readEmployee)

  /**
   * Delete an employee
   */
   router.delete(`${APP_ROUTES.EMPLOYEE}/:id`,
    authMiddleware, rbacMiddleware(RBAC.DELETE_EMPLOYEE), deleteEmployee)

  /**
   * Create a manager
   */
   router.post(APP_ROUTES.MANAGER,
    authMiddleware, rbacMiddleware(RBAC.CREATE_MANAGER), createManager)

  /**
   * Update a manager
   */
   router.put(`${APP_ROUTES.MANAGER}/:id`,
    authMiddleware, rbacMiddleware(RBAC.UPDATE_MANAGER), updateManager)

  /**
   * Get a manager
   */
    router.get(`${APP_ROUTES.MANAGER}/:id`,
      authMiddleware, rbacMiddleware(RBAC.READ_MANAGER), readManager)

  /**
   * Delete a manager
   */
   router.delete(`${APP_ROUTES.MANAGER}/:id`,
    authMiddleware, rbacMiddleware(RBAC.DELETE_MANAGER), deleteManager)
}
