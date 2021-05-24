/**
 * @file routeConstants.js
 * @description Application route constants
 */

/**
 * API Application Routes
 */
const APP_ROUTES = {
  // auth
  LOGIN: '/login',
  // user crud
  EMPLOYEE: '/employee',
  MANAGER: '/manager',
  // lists
  STORE_EMPLOYEES_LIST: '/stores/:id/employees',
  STORES_EMPLOYEES_LIST: '/stores/:id/descendants/employees',
  STORE_MANAGERS_LIST: '/stores/:id/managers',
  STORES_MANAGERS_LIST: '/stores/:id/descendants/managers',
  ROOT: '/'
}

module.exports = APP_ROUTES
