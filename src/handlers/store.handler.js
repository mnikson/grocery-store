/**
 * @file store.handler.js
 * @description Store handlers and business logic
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Libs
const mongoose = require('mongoose')
const _ = require('lodash')

// Utils
const AppError = require('../utils/app-error.utils');
const { COLLECTION_NAMES } = require('../utils/constants');
const errorCodesUtils = require('../utils/error-codes.utils')

// Models
const User = mongoose.model(COLLECTION_NAMES.USERS)
const Role = mongoose.model(COLLECTION_NAMES.ROLES)
const Store = mongoose.model(COLLECTION_NAMES.STORES)

/**
 * Get employees for the store
 * @param {String} id - Store id
 * @param {Object} originStore - Store
 * @void
 */
const storeEmployeesList = async (id, originStore) => {
  await Store.userHasAccess(originStore, id)

  // get the role
  const employeeRole = await Role.getEmployeeRole()

  const employees = await User.find({
    store: id,
    role: employeeRole.id
  })

  return employees
}

/**
 * Get employees for the store and his descendants
 * @param {String} id - Store id
 * @param {Object} originStore - Store
 * @void
 */
 const storeDescEmployeesList = async (id, originStore) => {
  await Store.userHasAccess(originStore, id)

  // Find store
  const store = await Store.findById(id)

  if (!store) {
    throw new AppError({
      ...errorCodesUtils.UNPROCESSABLE_ENTITY,
      message: 'Store not found'
    })
  }

  // get the role
  const employeeRole = await Role.getEmployeeRole()

  // collect descendant stores
  const stores = await store.getDescendants()

  const storeIds = _.map(stores, 'id')

  const employees = await User.find({
    $and: [
      { role: employeeRole.id },
      {
        $or: [
          { store: id },
          { store: { $in: storeIds } },
        ]
      }
    ]
  })

  return employees
}

/**
 * Get managers for the store
 * @param {String} id - Store id
 * @param {Object} originStore - Store
 * @void
 */
const storeManagersList = async (id, originStore) => {
  await Store.userHasAccess(originStore, id)

  // get the role
  const managerRole = await Role.getManagerRole()

  const managers = await User.find({
    store: id,
    role: managerRole.id
  })

  return managers
}

/**
 * Get managers for the store and his descendants
 * @param {String} id - Store id
 * @param {Object} originStore - Store
 * @void
 */
 const storeDescManagersList = async (id, originStore) => {
  await Store.userHasAccess(originStore, id)

  // Find store
  const store = await Store.findById(id)

  if (!store) {
    throw new AppError({
      ...errorCodesUtils.UNPROCESSABLE_ENTITY,
      message: 'Store not found'
    })
  }

  // get the role
  const managerRole = await Role.getManagerRole()

  // collect descendant stores
  const stores = await store.getDescendants()
  const storeIds = _.uniq(_.map(stores, 'id'))

  const managers = await User.find({
    role: managerRole.id,
    store: {
      $in: [
        id,
        ...storeIds
      ]
    }
  })

  return managers
}

module.exports = {
  storeEmployeesList,
  storeDescEmployeesList,
  storeDescManagersList,
  storeManagersList
}
