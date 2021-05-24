/**
 * @file user.handler.test
 * @description Tests for user handlers
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Libs
const { assert, should, expect } = require('chai')
const faker = require('faker')
const mongoose = require('mongoose')
const _ = require('lodash')

// Handlers
const { userHandler } = require('../../src/handlers')

// Utils
const { ROLES, makePasswordHash } = require('../../src/utils/auth.utils');
const { COLLECTION_NAMES } = require('../../src/utils/constants');
const { DEFAULT_USER_PASSWORD } = require('../config')
const errorCodesUtils = require('../../src/utils/error-codes.utils')
const { drop } = require('../setup/database')
const { initRoles, initStores } = require('../setup/faker')

// Models
const Role = mongoose.model(COLLECTION_NAMES.ROLES);
const User = mongoose.model(COLLECTION_NAMES.USERS);
const Store = mongoose.model(COLLECTION_NAMES.STORES);

let mainStore
let leafStore

describe('User handler tests', () => {

  before(async () => {
    // init db
    await initRoles()
    await initStores()

    const managerRole = await Role.findOne({ code: ROLES.MANAGER.CODE })
    const employeeRole = await Role.findOne({ code: ROLES.EMPLOYEE.CODE })
    const stores = await Store.find()

    mainStore = _.find(stores, store => store.left === 2)
    leafStore = _.find(stores, store => store.left === 5)

    const users = [
      {
        username: 'menadzer1',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: 'Menadzer 1',
        role: managerRole.id,
        store: mainStore.id
      },
      {
        username: 'radnik1',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: 'Radnik 1',
        role: employeeRole.id,
        store: mainStore.id
      },
      {
        username: 'menadzer2',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: managerRole.id,
        store: leafStore.id
      },
      {
        username: 'menadzer3',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: managerRole.id,
        store: leafStore.id
      },
      {
        username: 'radnik2',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: employeeRole.id,
        store: leafStore.id
      },
      {
        username: 'radnik3',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: employeeRole.id,
        store: leafStore.id
      },
      {
        username: 'radnik4',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: employeeRole.id,
        store: leafStore.id
      }
    ]

    await User.create(users)
  })

  after(async () => {
    await drop()
  })

  describe('loginUser', () => {

    let employee
    let manager
    let mainManager

    before(async () => {
      employee = await User.findOne({ username: 'radnik1' })
        .populate('store')

      manager = await User.findOne({ username: 'menadzer2' })
        .populate('store')

      mainManager = await User.findOne({ username: 'menadzer1' })
        .populate('store')
    })

    it('should not return user, username and password are missing', async () => {
      try {
        const username = 'noexist'
        const password = 'noexist'

        await userHandler.loginUser(username, password)

      } catch (err) {
        should(err).exist
        assert.equal(err.status, 422)
        assert.equal(err.message, 'No user found')
      }
    })

    it('should not return user, incorrect password', async () => {
      try {
        const username = 'menadzer1'
        const password = 'noexist'

        await userHandler.loginUser(username, password)
      } catch (err) {
        should(err).exist
        assert.equal(err.status, 422)
        assert.equal(err.message, 'Username and password doesn\'t match')
      }
    })

    it('should return user', async () => {
      try {
        const username = 'menadzer1'
        const password = DEFAULT_USER_PASSWORD

        const user = await userHandler.loginUser(username, password)

        assert.equal(user.username, username)
        expect(user.token).to.exist
      } catch (err) {
        expect(err).to.not.exist
      }
    })
  })

  describe('createEmployee', () => {

    let employeeStore

    let newUser

    before(async () => {
      employeeStore = await Store.findOne({
        left: 4
      })

      newUser = {
        name: 'test user',
        username: 'testuser',
        password: DEFAULT_USER_PASSWORD,
        store: employeeStore.id
      }
    })

    it('should not create employee, name is missing', async () => {
      try {
        await userHandler.createEmployee({
          ...newUser,
          name: ''
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Name is required')
      }
    })

    it('should not create employee, store is missing', async () => {
      try {
        await userHandler.createEmployee({
          ...newUser,
          store: null
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Store is required')
      }
    })

    it('should not create employee, username is missing', async () => {
      try {
        await userHandler.createEmployee({
          ...newUser,
          username: ''
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Username is required')
      }
    })

    it('should not create employee, password is missing', async () => {
      try {
        await userHandler.createEmployee({
          ...newUser,
          password: ''
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Password is required')
      }
    })

    it('should create employee with default role', async () => {
      try {
        const user = await userHandler.createEmployee({
          ...newUser,
          username: 'radnik-test',
          role: ''
        })

        expect(user).to.be.an('object')
        assert.equal(user.name, newUser.name)
        assert.equal(user.username, 'radnik-test')
        assert.equal(user.authenticate(newUser.password), true)
      } catch (err) {
        console.log(err.stack)
        expect(err).to.not.exist
      }
    })

    it('should create employee with manager role', async () => {
      try {
        const role = await Role.getManagerRole()
        const user = await userHandler.createEmployee({
          ...newUser,
          username: 'menadzer-test',
          role: role.id
        })

        expect(user).to.be.an('object')
        assert.equal(user.name, newUser.name)
        assert.equal(user.username, 'menadzer-test')
        assert.equal(user.authenticate(newUser.password), true)
        assert.equal(user.store, employeeStore.id)
      } catch (err) {
        console.log(err.stack)
        expect(err).to.not.exist
      }
    })

  })

  describe('updateEmployee', () => {

    let employeeStore
    let updateUser
    let employee

    before(async () => {
      employeeStore = await Store.findOne({
        left: 4
      })

      employee = await User.findOne({ username: 'radnik1' })

      updateUser = {
        name: 'test user',
        username: 'newusername',
        store: employeeStore.id
      }
    })

    it('should not update employee, name is missing', async () => {
      try {
        await userHandler.updateEmployee(employee.id, {
          ...updateUser,
          name: ''
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Name is required')
      }
    })

    it('should not update employee, store is missing', async () => {
      try {
        await userHandler.updateEmployee(employee.id, {
          ...updateUser,
          store: null
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Store is required')
      }
    })

    it('should not update employee, username is missing', async () => {
      try {
        await userHandler.updateEmployee(employee.id, {
          ...updateUser,
          username: ''
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Username is required')
      }
    })

    it('should update employee with manager role', async () => {
      try {
        const user = await userHandler.updateEmployee(employee.id, {
          ...updateUser
        })

        expect(user).to.be.an('object')
        assert.equal(user.name, updateUser.name)
        assert.equal(user.username, updateUser.username)
        assert.equal(user.store, employeeStore.id)
      } catch (err) {
        console.log(err.stack)
        expect(err).to.not.exist
      }
    })

  })

  describe('createManager', () => {

    let managerStore
    let newUser

    before(async () => {
      managerStore = await Store.findOne({
        left: 4
      })

      newUser = {
        name: 'test manager',
        username: 'testuser',
        password: DEFAULT_USER_PASSWORD,
        store: managerStore.id
      }
    })

    it('should not create manager, name is missing', async () => {
      try {
        await userHandler.createManager({
          ...newUser,
          name: ''
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Name is required')
      }
    })

    it('should not create manager, store is missing', async () => {
      try {
        await userHandler.createManager({
          ...newUser,
          store: null
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Store is required')
      }
    })

    it('should not create manager, username is missing', async () => {
      try {
        await userHandler.createManager({
          ...newUser,
          username: ''
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Username is required')
      }
    })

    it('should not create manager, password is missing', async () => {
      try {
        await userHandler.createManager({
          ...newUser,
          password: ''
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Password is required')
      }
    })

    it('should create manager with default role', async () => {
      try {
        const user = await userHandler.createManager({
          ...newUser,
          username: 'radnik-test',
          role: ''
        })

        expect(user).to.be.an('object')
        assert.equal(user.name, newUser.name)
        assert.equal(user.username, 'radnik-test')
        assert.equal(user.authenticate(newUser.password), true)
      } catch (err) {
        console.log(err.stack)
        expect(err).to.not.exist
      }
    })

    it('should create manager with manager role', async () => {
      try {
        const role = await Role.getManagerRole()
        const user = await userHandler.createManager({
          ...newUser,
          username: 'menadzer-test',
          role: role.id
        })

        expect(user).to.be.an('object')
        assert.equal(user.name, newUser.name)
        assert.equal(user.username, 'menadzer-test')
        assert.equal(user.authenticate(newUser.password), true)
        assert.equal(user.store, managerStore.id)
      } catch (err) {
        console.log(err.stack)
        expect(err).to.not.exist
      }
    })

  })

  describe('updateManager', () => {

    let managerStore
    let updateUser
    let employee

    before(async () => {
      managerStore = await Store.findOne({
        left: 4
      })

      employee = await User.findOne({ username: 'radnik1' })

      updateUser = {
        name: 'test manager',
        username: 'newusername',
        store: managerStore.id
      }
    })

    it('should not update manager, name is missing', async () => {
      try {
        employee = await User.findOne({ username: 'radnik3' })
        await userHandler.updateManager(employee.id, {
          ...updateUser,
          name: ''
        })
      } catch (err) {
        const { status } = errorCodesUtils.BAD_REQUEST
        expect(err).to.exist
        assert.equal(err.status, status)
        assert.equal(err.message, 'Name is required')
      }
    })

    it('should not update manager, store is missing', async () => {
      try {
        await userHandler.updateManager(employee.id, {
          ...updateUser,
          store: null
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Store is required')
      }
    })

    it('should not update manager, username is missing', async () => {
      try {
        await userHandler.updateManager(employee.id, {
          ...updateUser,
          username: ''
        })
      } catch (err) {
        expect(err).to.exist
        assert.equal(err.status, 400)
        assert.equal(err.message, 'Username is required')
      }
    })

    it('should update manager with manager role', async () => {
      try {
        const user = await userHandler.updateManager(employee.id, {
          ...updateUser
        })

        expect(user).to.be.an('object')
        assert.equal(user.name, updateUser.name)
        assert.equal(user.username, updateUser.username)
        assert.equal(user.store, managerStore.id)
      } catch (err) {
        console.log(err.stack)
        expect(err).to.not.exist
      }
    })

  })

  describe('getEmployee', () => {

    let manager
    let employee
    let targetEmployee
    let mainManager

    before(async () => {
      mainManager = await User.findOne({
        username: 'menadzer1'
      })
        .populate('store')
      manager = await User.findOne({
        username: 'menadzer2'
      })
        .populate('store')

      targetEmployee = await User.findOne({ username: 'radnik1' })
      employee = await User.findOne({ username: 'radnik2' })
        .populate('store')
    })

    it('should not get employee, manager do not have access', async () => {
      try {
        targetEmployee = await User.findOne({ username: 'radnik2' })
        await userHandler.getEmployee(targetEmployee.id, manager.store)
      } catch (err) {
        expect(err).to.exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should not get employee, employee do not have access', async () => {
      try {
        await userHandler.getEmployee(targetEmployee.id, employee.store)
      } catch (err) {
        expect(err).to.exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should get employee by manager', async () => {
      try {
        const user = await userHandler.getEmployee(employee.id, mainManager.store)

        expect(user).to.be.an('object')
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should get employee by store employee', async () => {
      try {
        const storeEmployee1 = await User.findOne({ username: 'radnik2' })
          .populate('store')
        const storeEmployee2 = await User.findOne({ username: 'radnik4' })

        const user = await userHandler.getEmployee(storeEmployee2.id, storeEmployee1.store)

        expect(user).to.be.an('object')
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })
  })

  describe('deleteEmployee', () => {

    let manager
    let employee
    let targetEmployee
    let mainManager

    before(async () => {
      mainManager = await User.findOne({
        username: 'menadzer1'
      })
        .populate('store')
      manager = await User.findOne({
        username: 'menadzer2'
      })
        .populate('store')

      targetEmployee = await User.findOne({ username: 'radnik1' })
      employee = await User.findOne({ username: 'radnik2' })
        .populate('store')
    })

    beforeEach(async () => {
      const employeeRole = await Role.findOne({ code: ROLES.EMPLOYEE.CODE })
      const leafStore = await Store.findOne({
        left: 5
      })

      await User.create([
        {
          username: 'radnik1',
          password: makePasswordHash(DEFAULT_USER_PASSWORD),
          name: `${faker.name.firstName()} ${faker.name.lastName()}`,
          role: employeeRole.id,
          store: leafStore.id
        },
        {
          username: 'radnik2',
          password: makePasswordHash(DEFAULT_USER_PASSWORD),
          name: `${faker.name.firstName()} ${faker.name.lastName()}`,
          role: employeeRole.id,
          store: leafStore.id
        },
        {
          username: 'radnik3',
          password: makePasswordHash(DEFAULT_USER_PASSWORD),
          name: `${faker.name.firstName()} ${faker.name.lastName()}`,
          role: employeeRole.id,
          store: leafStore.id
        }
      ])
    })

    it('should not delete employee, manager do not have access', async () => {
      try {
        targetEmployee = await User.findOne({ username: 'radnik1' })
        await userHandler.deleteEmployee(targetEmployee.id, manager.store)
      } catch (err) {
        expect(err).to.exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should not delete employee by employee', async () => {
      try {
        const user = await userHandler.getEmployee(employee.id, employee.store)

        expect(user).to.be.an('object')
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should delete employee by manager', async () => {
      try {
        const user = await userHandler.deleteEmployee(employee.id, mainManager.store)

        expect(user).to.be.an('object')
        // try to find deleted user
        const data = await User.findById(employee.id)
        expect(data).to.be.null
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should delete employee by store employee', async () => {
      try {
        const storeEmployee1 = await User.findOne({ username: 'radnik2' })
          .populate('store')
        const storeEmployee2 = await User.findOne({ username: 'radnik3' })
          .populate('store')

        const user = await userHandler.deleteEmployee(storeEmployee1.id, storeEmployee2.store)

        expect(user).to.be.an('object')
        // try to find deleted user
        const data = await User.findById(employee.id)
        expect(data).to.be.null
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

  })

  describe('getManager', () => {

    let manager
    let employee
    let targetManager
    let mainManager

    before(async () => {
      mainManager = await User.findOne({
        username: 'menadzer1'
      })
        .populate('store')

      manager = await User.findOne({
        username: 'menadzer2'
      })
        .populate('store')

      targetManager = await User.findOne({ username: 'menadzer3' })
        .populate('store')

      employee = await User.findOne({ username: 'radnik2' })
        .populate('store')
    })

    it('should not get a manager, manager do not have access', async () => {
      try {
        manager = await User.findOne({
          username: 'menadzer2'
        }).populate('store')

        targetManager = await User.findOne({
          username: 'menadzer1'
        })
          .populate('store')

        await userHandler.getManager(targetManager.id, manager.store)
      } catch (err) {
        expect(err).to.exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should not get a manager, employee do not have access', async () => {
      try {
        targetManager = await User.findOne({
          username: 'menadzer1'
        })
          .populate('store')

        employee = await User.findOne({ username: 'radnik2' })
          .populate('store')
        await userHandler.getManager(targetManager.id, employee.store)
      } catch (err) {
        expect(err).to.exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should not get a manager by store employee', async () => {
      try {
        const storeEmployee1 = await User.findOne({ username: 'radnik2' })
          .populate('store')
        const storeEmployee2 = await User.findOne({ username: 'radnik3' })

        await userHandler.getEmployee(storeEmployee2.id, storeEmployee1.store)
      } catch (err) {
        expect(err).to.exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should get a manager by other manager', async () => {
      try {
        mainManager = await User.findOne({
          username: 'menadzer1'
        })
          .populate('store')

        employee = await User.findOne({ username: 'radnik2' })
          .populate('store')

        const user = await userHandler.getEmployee(employee.id, mainManager.store)

        expect(user).to.be.an('object')
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

  })


  describe('deleteManager', () => {

    let manager
    let employee
    let targetManager
    let mainManager

    beforeEach(async () => {
      mainManager = await User.findOne({
        username: 'menadzer1'
      })
        .populate('store')

      manager = await User.findOne({
        username: 'menadzer2'
      })
        .populate('store')

      targetManager = await User.findOne({ username: 'menadzer3' })

      employee = await User.findOne({ username: 'radnik2' })
        .populate('store')
    })

    beforeEach(async () => {
      const managerRole = await Role.getManagerRole()
      const employeeRole = await Role.getEmployeeRole()
      const leafStore = await Store.findOne({
        left: 5
      })

      await User.create([
        {
          username: 'menadzer2',
          password: makePasswordHash(DEFAULT_USER_PASSWORD),
          name: `${faker.name.firstName()} ${faker.name.lastName()}`,
          role: managerRole.id,
          store: leafStore.id
        },
        {
          username: 'menadzer3',
          password: makePasswordHash(DEFAULT_USER_PASSWORD),
          name: `${faker.name.firstName()} ${faker.name.lastName()}`,
          role: managerRole.id,
          store: leafStore.id
        },
        {
          username: 'radnik2',
          password: makePasswordHash(DEFAULT_USER_PASSWORD),
          name: `${faker.name.firstName()} ${faker.name.lastName()}`,
          role: employeeRole.id,
          store: leafStore.id
        }
      ])
    })

    it('should not delete manager, manager do not have access', async () => {
      try {
        await userHandler.deleteManager(mainManager.id, manager.store)
      } catch (err) {
        expect(err).to.exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should not delete manager, employee do not have access', async () => {
      try {
        await userHandler.deleteManager(targetManager.id, employee.store)
      } catch (err) {
        expect(err).to.exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should not delete manager by employee', async () => {
      try {
        const user = await userHandler.getManager(targetManager.id, employee.store)

        expect(user).to.be.an('object')
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should delete manager by manager', async () => {
      try {
        const user = await userHandler.deleteEmployee(employee.id, mainManager.store)

        expect(user).to.be.an('object')
        // try to find deleted user
        const data = await User.findById(employee.id)
        expect(data).to.be.null
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

  })

})
