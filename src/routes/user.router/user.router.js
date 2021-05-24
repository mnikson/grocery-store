/**
 * @file user.router
 * @description User router
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Handlers
const { userHandler } = require('../../handlers')

// Utils
const AppError = require('../../utils/app-error.utils')
const errorCodesUtils = require('../../utils/error-codes.utils')

// Models
const { Store } = require('../../models')

/**
 * Create employee
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @void
 */
const createEmployee = async (req, res, next) => {
  try {
    const {
      body: {
        name,
        username,
        password,
        store
      },
      currentUser: {
        _doc: currentUser
      }
    } = req

    // check whether a user has access to the store
    const storeAccess = await Store.userHasAccess(currentUser.store, store)

    if (!storeAccess) {
      throw new AppError({
        ...errorCodesUtils.STORE_FORBIDDEN
      })
    }

    // create user
    const user = await userHandler.createEmployee({
      name,
      username,
      password,
      store
    })

    res.json({
      data: user
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * Update employee
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @void
 */
 const updateEmployee = async (req, res, next) => {
  try {
    const {
      body: {
        name,
        username,
        password,
        store
      },
      currentUser: {
        _doc: currentUser
      },
      params: { id }
    } = req

    // check whether a user has access to the store
    const storeAccess = await Store.userHasAccess(currentUser.store, store)

    if (!storeAccess) {
      throw new AppError({
        ...errorCodesUtils.STORE_FORBIDDEN
      })
    }

    // update user
    const user = await userHandler.updateEmployee(id, {
      name,
      username,
      password,
      store
    })

    res.json({
      data: user
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * Create manager
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @void
 */
 const createManager = async (req, res, next) => {
  try {
    const {
      body: {
        name,
        username,
        password,
        store
      },
      currentUser: {
        _doc: currentUser
      }
    } = req

    // check whether a user has access to the store
    const storeAccess = await Store.userHasAccess(currentUser.store, store)

    if (!storeAccess) {
      throw new AppError({
        ...errorCodesUtils.STORE_FORBIDDEN
      })
    }

    // create user
    const user = await userHandler.createManager({
      name,
      username,
      password,
      store
    })

    res.json({
      data: user
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * Update manager
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @void
 */
 const updateManager = async (req, res, next) => {
  try {
    const {
      body: {
        name,
        username,
        password,
        store
      },
      currentUser: {
        _doc: currentUser
      },
      params: { id }
    } = req

    // check whether a user has access to the store
    await Store.userHasAccess(currentUser.store, store)

    // update user
    const user = await userHandler.updateManager(id, {
      name,
      username,
      password,
      store
    })

    res.json({
      data: user
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * Read employee
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @void
 */
const readEmployee = async (req, res, next) => {
  try {
    const {
      currentUser: {
        _doc: currentUser
      },
      params: { id }
    } = req

    const data = await userHandler.getEmployee(id, currentUser.store)

    res.json({
      data
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * Delete employee
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @void
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const {
      currentUser: {
        _doc: currentUser
      },
      params: { id }
    } = req

    const data = await userHandler.deleteEmployee(id, currentUser.store)

    res.json({
      data
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * Read manager
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @void
 */
const readManager = async (req, res, next) => {
  try {
    const {
      currentUser: {
        _doc: currentUser
      },
      params: { id }
    } = req

    const data = await userHandler.getManager(id, currentUser.store)

    res.json({
      data
    })
  } catch (err) {
    return next(err)
  }
}

/**
 * Delete manager
 * @param {Function} req - Request
 * @param {Function} res - Response
 * @param {Function} next - Middleware
 * @void
 */
 const deleteManager = async (req, res, next) => {
  try {
    const {
      currentUser: {
        _doc: currentUser
      },
      params: { id }
    } = req

    const data = await userHandler.deleteManager(id, currentUser.store)

    res.json({
      data
    })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  createEmployee,
  createManager,
  deleteEmployee,
  deleteManager,
  readEmployee,
  readManager,
  updateEmployee,
  updateManager
}
