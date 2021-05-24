/**
 * @file user.handler.js
 * @description User handlers and business logic
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Libs
const mongoose = require('mongoose')

// Utils
const AppError = require('../utils/app-error.utils');
const { makeAccessToken, makePasswordHash } = require('../utils/auth.utils');
const { COLLECTION_NAMES } = require('../utils/constants');
const errorCodesUtils = require('../utils/error-codes.utils')

// Models
const User = mongoose.model(COLLECTION_NAMES.USERS)
const Role = mongoose.model(COLLECTION_NAMES.ROLES)
const Store = mongoose.model(COLLECTION_NAMES.STORES)

/**
 * Login user
 * @param {String} username - Username
 * @param {String} password - Password
 * @returns {Object} - User
 */
const loginUser = async (username, password) => {
  // try to find user by username
  const user = await User.findOne({
    username
  })

  if (!user) {
    throw new AppError({
      ...errorCodesUtils.UNPROCESSABLE_ENTITY,
      message: 'No user found'
    })
  }

  // check if password is correct
  if (!user.authenticate(password)) {
    throw new AppError({
      ...errorCodesUtils.UNPROCESSABLE_ENTITY,
      message: 'Username and password doesn\'t match'
    })
  }

  // generate access token
  const token = await makeAccessToken(user)
  user.token = token

  return user
}

/**
 * Create employee
 * @param {String} name - User's name
 * @param {String} username - User's username
 * @param {String} password - User's password
 * @param {String} store - Store
 * @returns
 */
const createEmployee = async ({
  name,
  username,
  password,
  store = null
}) => {
  if (!name) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Name is required'
    })
  }

  if (!username) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Username is required'
    })
  }

  if (!store) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Store is required'
    })
  }

  if (!password) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Password is required'
    })
  }

  // Get employee role
  const employeeRole = await Role.getEmployeeRole()

  const user = await User.create({
    name,
    username,
    password: makePasswordHash(password),
    role: employeeRole.id,
    store
  })

  return user
}

/**
 * Update employee
 * @param {String} name - User's name
 * @param {String} username - User's username
 * @param {String} password - User's password
 * @param {String} store - Store
 * @returns
 */
 const updateEmployee = async (id, {
  name,
  username,
  password,
  store = null
}) => {
  if (!name) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Name is required'
    })
  }

  if (!username) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Username is required'
    })
  }

  if (!store) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Store is required'
    })
  }

  const update = {
    name,
    username,
    store
  }

  if (password) {
    Object.assign(update, {
      password: makePasswordHash(password)
    })
  }

  // Update employee
  const user = await User.findOneAndUpdate({ _id: id }, {
    ...update
  }, {
    new: true
  })

  if (!user) {
    throw new AppError({
      ...errorCodesUtils.UNPROCESSABLE_ENTITY,
      message: 'User not found'
    })
  }

  return user
}

/**
 * Create manager
 * @param {String} name - User's name
 * @param {String} username - User's username
 * @param {String} password - User's password
 * @param {String} store - Store
 * @returns
 */
 const createManager = async ({
  name,
  username,
  password,
  store = null
}) => {
  if (!name) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Name is required'
    })
  }

  if (!username) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Username is required'
    })
  }

  if (!store) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Store is required'
    })
  }

  if (!password) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Password is required'
    })
  }

  // Get manager role
  const managerRole = await Role.getManagerRole()

  const user = await User.create({
    name,
    username,
    password: makePasswordHash(password),
    role: managerRole.id,
    store
  })

  return user
}

/**
 * Update manager
 * @param {String} name - User's name
 * @param {String} username - User's username
 * @param {String} password - User's password
 * @param {String} store - Store
 * @returns
 */
 const updateManager = async (id, {
  name,
  username,
  password,
  store = null
}) => {
  if (!name) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Name is required'
    })
  }

  if (!username) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Username is required'
    })
  }

  if (!store) {
    throw new AppError({
      ...errorCodesUtils.BAD_REQUEST,
      message: 'Store is required'
    })
  }

  const update = {
    name,
    username,
    store
  }

  if (password) {
    Object.assign(update, {
      password: makePasswordHash(password)
    })
  }

  // Update manager
  const user = await User.findOneAndUpdate({ _id: id }, {
    ...update
  }, {
    new: true
  })

  if (!user) {
    throw new AppError({
      ...errorCodesUtils.UNPROCESSABLE_ENTITY,
      message: 'User not found'
    })
  }

  return user
}

/**
 * Get user
 * @param {String} id - Employee id
 * @param {Object} originStore - Origin store
 * @returns {Object} - User
 */
const getEmployee = async (id, originStore) => {
  const user = await User.findById(id)

  // check whether a user has access to the store
  await Store.userHasAccess(originStore, user.store)

  return user
}

/**
 * Delete employee
 * @param {String} id - User id
 * @param {Object} originStore - Store
 * @returns {Object} - Delete status
 */
const deleteEmployee = async (id, originStore) => {
  const employeeRole = await Role.getEmployeeRole()
  const user = await User.findOne({
    _id: id,
    role: employeeRole.id
  })

  if (!user) {
    throw new AppError({
      ...errorCodesUtils.UNPROCESSABLE_ENTITY,
      message: 'User not found'
    })
  }

  // check whether a user has access to the store
  await Store.userHasAccess(originStore, user.store)

  return await user.delete()
}

/**
 * Get manager
 * @param {String} id - Manager id
 * @param {Object} originStore - Origin store
 * @returns {Object} - User
 */
 const getManager = async (id, originStore) => {
  const managerRole = await Role.getManagerRole()
  const user = await User.findOne({
    _id: id,
    role: managerRole.id
  })

  // check whether a user has access to the store
  await Store.userHasAccess(originStore, user.store)

  return user
}

/**
 * Delete manager
 * @param {String} id - User id
 * @param {Object} originStore - Store
 * @returns {Object} - Delete status
 */
 const deleteManager = async (id, originStore) => {
  const managerRole = await Role.getManagerRole()

  const user = await User.findOne({
    _id: id,
    role: managerRole.id
  })

  if (!user) {
    throw new AppError({
      ...errorCodesUtils.UNPROCESSABLE_ENTITY,
      message: 'User not found'
    })
  }

  // check whether a user has access to the store
  await Store.userHasAccess(originStore, user.store)

  return await user.delete()
}

module.exports = {
  loginUser,
  createEmployee,
  createManager,
  deleteEmployee,
  deleteManager,
  getEmployee,
  getManager,
  updateEmployee,
  updateManager
}
