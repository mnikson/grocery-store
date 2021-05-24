// Libs
const _ = require('lodash')
const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const faker = require('faker')

chai.use(chaiHttp)

const app = require('../../src/app')

// Utils
const { DEFAULT_USER_PASSWORD } = require('../config')
const { COLLECTION_NAMES } = require('../../src/utils/constants')
const { makePasswordHash, makeAccessToken, ROLES } = require('../../src/utils/auth.utils')
const { assert } = require('chai')
const errorCodesUtils = require('../../src/utils/error-codes.utils')
const { drop, dropCollection } = require('../setup/database')
const { initRoles, initStores } = require('../setup/faker')

// Models
// const { Role, Store, User } = require('../../src/models')
const Role = mongoose.model(COLLECTION_NAMES.ROLES)
const Store = mongoose.model(COLLECTION_NAMES.STORES)
const User = mongoose.model(COLLECTION_NAMES.USERS)

let mainStore
let leafStore1
let leafStore2
let rootStore
let mainStore2
let leafStore3
let leafStore4
let stores
let managerRole
let employeeRole

describe('store router tests', () => {

  before(async () => {
    // init data
    await initRoles()
    await initStores()

    managerRole = await Role.findOne({ code: ROLES.MANAGER.CODE })
    employeeRole = await Role.findOne({ code: ROLES.EMPLOYEE.CODE })
    stores = await Store.find()

    rootStore = _.find(stores, store => store.name === 'Srbija')
    mainStore = _.find(stores, store => store.name === 'Vojvodina')
    leafStore1 = _.find(stores, store => store.name === 'Subotica')
    leafStore2 = _.find(stores, store => store.name === 'Radnja 4')
    mainStore2 = _.find(stores, store => store.name === 'Grad Beograd')
    leafStore3 = _.find(stores, store => store.name === 'Crveni krst')
    leafStore4 = _.find(stores, store => store.name === 'Radnja 9')

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
        username: 'menadzer5',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: managerRole.id,
        store: leafStore3.id
      },
      {
        username: 'menadzer6',
        password: makePasswordHash(DEFAULT_USER_PASSWORD),
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        role: managerRole.id,
        store: leafStore4.id
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

  describe('store employees', () => {
    it('should not get employees, not authorized', async () => {
      try {
        const response = await chai.request(app)
          .get(`/stores/${leafStore1.id}/employees`)
          .set({
            Authorization: ''
          })

        const { status, description } = errorCodesUtils.AUTHENTICATION_FAILED
        expect(response.status).to.equal(status)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(description)
      } catch (err) {
        console.log(err.stack)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should not get employees, manager has no permission', async () => {
      try {
        const manager = await User.findOne({ username: 'menadzer4' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`/stores/${leafStore1.id}/employees`)
          .set({
            Authorization: `Bearer ${token}`
          })

        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        expect(response.status).to.equal(status)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(description)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should not get employees, employee do not have permission', async () => {
      try {
        const employee = await User.findOne({ username: 'radnik3' })
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .get(`/stores/${leafStore2.id}/employees`)
          .set({
            Authorization: `Bearer ${token}`
          })

        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        expect(response.status).to.equal(status)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(description)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should get employees for manager', async () => {
      try {
        const manager = await User.findOne({ username: 'menadzer4' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`/stores/${leafStore2.id}/employees`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

  })

  describe('store and descendant stores employees', () => {
    it('should not get employees, not authorized', async () => {
      try {
        const response = await chai.request(app)
          .get(`/stores/${leafStore1.id}/descendants/employees`)
          .set({
            Authorization: ''
          })

        const { status, description } = errorCodesUtils.AUTHENTICATION_FAILED
        expect(response.status).to.equal(status)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(description)
      } catch (err) {
        console.log(err.stack)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should not get employees, manager has no permission', async () => {
      try {
        const manager = await User.findOne({ username: 'menadzer4' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`/stores/${leafStore1.id}/descendants/employees`)
          .set({
            Authorization: `Bearer ${token}`
          })

        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        expect(response.status).to.equal(status)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(description)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should not get employees, employee do not have permission', async () => {
      try {
        const employee = await User.findOne({ username: 'radnik3' })
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .get(`/stores/${leafStore2.id}/descendants/employees`)
          .set({
            Authorization: `Bearer ${token}`
          })

        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        expect(response.status).to.equal(status)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(description)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should get employees for manager', async () => {
      try {
        const manager = await User.findOne({ username: 'menadzer4' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`/stores/${leafStore2.id}/descendants/employees`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.length, 3)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should get employees for main manager', async () => {
      try {
        const manager = await User.findOne({ username: 'menadzer0' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`/stores/${leafStore2.id}/descendants/employees`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body

        assert.equal(data.length, 3)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

  })

  describe('store managers', () => {
    it('should not get managers, not authorized', async () => {
      try {
        const response = await chai.request(app)
          .get(`/stores/${leafStore1.id}/managers`)
          .set({
            Authorization: ''
          })

        const { status, description } = errorCodesUtils.AUTHENTICATION_FAILED
        expect(response.status).to.equal(status)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(description)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should not get managers, manager has no permission', async () => {
      try {
        const manager = await User.findOne({ username: 'menadzer4' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`/stores/${leafStore1.id}/managers`)
          .set({
            Authorization: `Bearer ${token}`
          })

        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        expect(response.status).to.equal(status)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(description)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should not get managers, employee do not have permission', async () => {
      try {
        const employee = await User.findOne({ username: 'radnik3' })
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .get(`/stores/${leafStore2.id}/managers`)
          .set({
            Authorization: `Bearer ${token}`
          })

        const { status, description } = errorCodesUtils.FORBIDDEN
        expect(response.status).to.equal(status)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(description)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should get managers for manager', async () => {
      try {
        const manager = await User.findOne({ username: 'menadzer4' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`/stores/${manager.store}/managers`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

  })

  describe('store and descendant stores managers', () => {

    before(async () => {
      // init data
      await initRoles()
      await initStores()

      managerRole = await Role.findOne({ code: ROLES.MANAGER.CODE })
      employeeRole = await Role.findOne({ code: ROLES.EMPLOYEE.CODE })
      stores = await Store.find()

      rootStore = _.find(stores, store => store.name === 'Srbija')
      mainStore = _.find(stores, store => store.name === 'Vojvodina')
      leafStore1 = _.find(stores, store => store.name === 'Subotica')
      leafStore2 = _.find(stores, store => store.name === 'Radnja 4')
      mainStore2 = _.find(stores, store => store.name === 'Grad Beograd')
      leafStore3 = _.find(stores, store => store.name === 'Crveni krst')
      leafStore4 = _.find(stores, store => store.name === 'Radnja 9')

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
          username: 'menadzer5',
          password: makePasswordHash(DEFAULT_USER_PASSWORD),
          name: `${faker.name.firstName()} ${faker.name.lastName()}`,
          role: managerRole.id,
          store: leafStore3.id
        },
        {
          username: 'menadzer6',
          password: makePasswordHash(DEFAULT_USER_PASSWORD),
          name: `${faker.name.firstName()} ${faker.name.lastName()}`,
          role: managerRole.id,
          store: leafStore4.id
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

    it('should not get managers, not authorized', async () => {
      try {
        const response = await chai.request(app)
          .get(`/stores/${leafStore1.id}/descendants/managers`)
          .set({
            Authorization: ''
          })

        const { status, description } = errorCodesUtils.AUTHENTICATION_FAILED
        expect(response.status).to.equal(status)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(description)
      } catch (err) {
        console.log(err.stack)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should not get managers, manager has no permission', async () => {
      try {
        const manager = await User.findOne({ username: 'menadzer4' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`/stores/${leafStore1.id}/descendants/managers`)
          .set({
            Authorization: `Bearer ${token}`
          })

        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
        expect(response.status).to.equal(status)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(description)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should not get managers, employee do not have permission', async () => {
      try {
        const employee = await User.findOne({ username: 'radnik3' })
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .get(`/stores/${leafStore2.id}/descendants/managers`)
          .set({
            Authorization: `Bearer ${token}`
          })

        const { status, description } = errorCodesUtils.FORBIDDEN
        expect(response.status).to.equal(status)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(description)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should get managers for manager', async () => {
      try {
        const manager = await User.findOne({ username: 'menadzer4' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`/stores/${manager.store}/descendants/managers`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.length, 6)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should get managers for main manager', async () => {
      try {
        const manager = await User.findOne({ username: 'menadzer0' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`/stores/${manager.store}/descendants/managers`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body

        assert.equal(data.length, 6)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

  })

})
