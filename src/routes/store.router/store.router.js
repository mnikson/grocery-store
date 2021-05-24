/**
 * @file store.router.js
 * @description Store router
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Handlers
const { storeHandler } = require('../../handlers')

/**
 * Get store employees
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @returns {Array} - Employees list
 */
const storeEmployeesList = async (req, res, next) => {
  try {
    const {
      currentUser: {
        _doc: currentUser
      },
      params: { id }
    } = req

    const data = await storeHandler.storeEmployeesList(id, currentUser.store)

    res.json({
      data
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * Get store and all descendants employees
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @returns {Array} - Employees list
 */
 const storeAndDescEmployeesList = async (req, res, next) => {
  try {
    const {
      currentUser: {
        _doc: currentUser
      },
      params: { id }
    } = req

    const data = await storeHandler.storeDescEmployeesList(id, currentUser.store)

    res.json({
      data
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * Get store managers
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @returns {Array} - Managers list
 */
const storeManagersList = async (req, res, next) => {
  try {
    const {
      currentUser: {
        _doc: currentUser
      },
      params: { id }
    } = req

    const data = await storeHandler.storeManagersList(id, currentUser.store)

    res.json({
      data
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * Get store and all descendants managers
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @returns {Array} - Employees list
 */
 const storeAndDescManagersList = async (req, res, next) => {
  try {
    const {
      currentUser: {
        _doc: currentUser
      },
      params: { id }
    } = req

    const data = await storeHandler.storeDescManagersList(id, currentUser.store)

    res.json({
      data
    })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  storeEmployeesList,
  storeAndDescEmployeesList,
  storeAndDescManagersList,
  storeManagersList
}
