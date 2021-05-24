/**
 * @file store.handler.test
 * @description Tests for store handlers
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Libs
const { assert, should, expect } = require('chai')
const faker = require('faker')
const mongoose = require('mongoose')
const _ = require('lodash')

// Handlers
const { storeHandler } = require('../../src/handlers')

// Utils
const { ROLES, makePasswordHash } = require('../../src/utils/auth.utils');
const { COLLECTION_NAMES } = require('../../src/utils/constants');
const { DEFAULT_USER_PASSWORD } = require('../config')
const errorCodesUtils = require('../../src/utils/error-codes.utils')
const { drop } = require('lodash')
const { initRoles, initStores } = require('../setup/faker')

// Models
const Role = mongoose.model(COLLECTION_NAMES.ROLES);
const User = mongoose.model(COLLECTION_NAMES.USERS);
const Store = mongoose.model(COLLECTION_NAMES.STORES);

let mainStore
let leafStore1
let leafStore2
let rootStore

describe('Store handler tests', () => {

  before(async () => {
    // init data
    await initRoles()
    await initStores()

    const managerRole = await Role.findOne({ code: ROLES.MANAGER.CODE })
    const employeeRole = await Role.findOne({ code: ROLES.EMPLOYEE.CODE })
    const stores = await Store.find()

    rootStore = _.find(stores, store => store.left === 1)
    mainStore = _.find(stores, store => store.left === 2)
    leafStore1 = _.find(stores, store => store.left === 5)
    leafStore2 = _.find(stores, store => store.left === 14)

    const users = [
      {
        username: 'menadzer0',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: 'Menadzer 0',
        role: managerRole.id,
        store: rootStore.id
      },
      {
        username: 'menadzer1',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: 'Menadzer 1',
        role: managerRole.id,
        store: mainStore.id
      },
      {
        username: 'menadzer2',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: managerRole.id,
        store: leafStore1.id
      },
      {
        username: 'menadzer3',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: managerRole.id,
        store: leafStore1.id
      },
      {
        username: 'menadzer4',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: managerRole.id,
        store: leafStore2.id
      },
      {
        username: 'radnik1',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: 'Radnik 1',
        role: employeeRole.id,
        store: mainStore.id
      },
      {
        username: 'radnik2',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: employeeRole.id,
        store: leafStore1.id
      },
      {
        username: 'radnik3',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: employeeRole.id,
        store: leafStore1.id
      },
      {
        username: 'radnik4',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: employeeRole.id,
        store: leafStore1.id
      },
      {
        username: 'radnik5',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: employeeRole.id,
        store: leafStore2.id
      },
      {
        username: 'radnik6',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: employeeRole.id,
        store: leafStore2.id
      },
      {
        username: 'radnik7',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: employeeRole.id,
        store: leafStore2.id
      }
    ]

    await User.create(users)
  })

  after(async () => {
    await drop()
  })

  describe('storeEmployeesList', () => {

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

    it('should not return employees, a manager has no access to the store', async () => {
      try {
        await storeHandler.storeEmployeesList(mainStore.id, manager.store)
      } catch (err) {
        should(err).exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should not return employees, an employee has no access to the store', async () => {
      try {
        await storeHandler.storeEmployeesList(mainStore.id, employee.store)
      } catch (err) {
        should(err).exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should return employees for manager', async () => {
      try {
        const results = await storeHandler.storeEmployeesList(leafStore1.id, manager.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 3)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should return employees for the main manager', async () => {
      try {
        const results = await storeHandler.storeEmployeesList(leafStore1.id, mainManager.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 3)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should return employees for employee', async () => {
      try {
        const results = await storeHandler.storeEmployeesList(leafStore1.id, employee.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 3)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

  })

  describe('storeDescEmployeesList', () => {

    let employee
    let manager
    let mainManager
    let rootManager

    before(async () => {
      employee = await User.findOne({ username: 'radnik1' })
        .populate('store')

      manager = await User.findOne({ username: 'menadzer2' })
        .populate('store')

      mainManager = await User.findOne({ username: 'menadzer1' })
        .populate('store')

      rootManager = await User.findOne({ username: 'menadzer0' })
        .populate('store')
    })

    it('should not return employees, a manager has no access to the store', async () => {
      try {
        await storeHandler.storeDescEmployeesList(mainStore.id, manager.store)
      } catch (err) {
        should(err).exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should not return employees, an employee has no access to the store', async () => {
      try {
        await storeHandler.storeDescEmployeesList(mainStore.id, employee.store)
      } catch (err) {
        should(err).exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should return stores employees for manager', async () => {
      try {
        const results = await storeHandler.storeDescEmployeesList(leafStore1.id, manager.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 6)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should return employees for the main manager', async () => {
      try {
        const results = await storeHandler.storeDescEmployeesList(leafStore1.id, mainManager.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 6)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should return employees for employee', async () => {
      try {
        const results = await storeHandler.storeDescEmployeesList(leafStore1.id, employee.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 6)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should return employees for the main store and his descendants, by main manager', async () => {
      try {
        const results = await storeHandler.storeDescEmployeesList(rootStore.id, rootManager.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 3)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

  })

  describe('storeManagersList', () => {

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

    it('should not return managers, a manager has no access to the store', async () => {
      try {
        await storeHandler.storeManagersList(mainStore.id, manager.store)
      } catch (err) {
        should(err).exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should not return managers, an employee has no access to the store', async () => {
      try {
        await storeHandler.storeManagersList(mainStore.id, employee.store)
      } catch (err) {
        should(err).exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should return managers for manager', async () => {
      try {
        const results = await storeHandler.storeManagersList(leafStore1.id, manager.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 2)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should return managers for the main manager', async () => {
      try {
        const results = await storeHandler.storeManagersList(leafStore1.id, mainManager.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 2)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should return employees for employee', async () => {
      try {
        const results = await storeHandler.storeManagersList(leafStore1.id, employee.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 2)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

  })

  describe('storeDescManagersList', () => {

    let employee
    let manager
    let mainManager
    let rootManager

    before(async () => {
      employee = await User.findOne({ username: 'radnik1' })
        .populate('store')

      manager = await User.findOne({ username: 'menadzer2' })
        .populate('store')

      mainManager = await User.findOne({ username: 'menadzer1' })
        .populate('store')

      rootManager = await User.findOne({ username: 'menadzer0' })
        .populate('store')
    })

    it('should not return managers, a manager has no access to the store', async () => {
      try {
        await storeHandler.storeDescManagersList(mainStore.id, manager.store)
      } catch (err) {
        should(err).exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should not return managers, an employee has no access to the store', async () => {
      try {
        await storeHandler.storeDescManagersList(mainStore.id, employee.store)
      } catch (err) {
        should(err).exist
        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        assert.equal(err.status, status)
        assert.equal(err.message, description)
      }
    })

    it('should return stores managers for manager', async () => {
      try {
        const results = await storeHandler.storeDescManagersList(leafStore1.id, manager.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 3)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should return managers for the main manager', async () => {
      try {
        const results = await storeHandler.storeDescManagersList(leafStore1.id, mainManager.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 3)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should return managers for employee', async () => {
      try {
        const results = await storeHandler.storeDescManagersList(leafStore1.id, employee.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 3)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

    it('should return managers for the main store and his descendants, by main manager', async () => {
      try {
        const results = await storeHandler.storeDescManagersList(rootStore.id, rootManager.store)

        expect(results).to.be.an('array')
        assert.equal(results.length, 2)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
      }
    })

  })

})
