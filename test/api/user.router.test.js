// Libs
const _ = require('lodash')
const chai = require('chai')
const { expect } = chai
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')

chai.use(chaiHttp)

const app = require('../../src/app')

// Utils
const APP_ROUTES = require('../../src/utils/route-constants.utils')
const { DEFAULT_USER_PASSWORD } = require('../config')
const { COLLECTION_NAMES } = require('../../src/utils/constants')
const { makePasswordHash, makeAccessToken } = require('../../src/utils/auth.utils')
const { assert } = require('chai')
const errorCodesUtils = require('../../src/utils/error-codes.utils')
const { drop } = require('../setup/database')

// Models
// const { Role, Store, User } = require('../../src/models')
const Role = mongoose.model(COLLECTION_NAMES.ROLES)
const Store = mongoose.model(COLLECTION_NAMES.STORES)
const User = mongoose.model(COLLECTION_NAMES.USERS)


describe('user router tests', () => {

  const password = makePasswordHash(DEFAULT_USER_PASSWORD)
  let mainStore
  let leafStore

  before(async () => {
    // manager role
    const managerRole = await Role.getManagerRole()
    const employeeRole = await Role.getEmployeeRole()
    const stores = await Store.find()

    mainStore = _.find(stores, store => store.left === 2)
    leafStore = _.find(stores, store => store.left === 5)

    const usersData = [
      {
        name: 'Glavni Menadzer',
        username: 'glavni-menadzer',
        role: managerRole.id,
        store: mainStore.id,
        password
      },
      {
        name: 'Menadzer 1',
        username: 'menadzer-radnje',
        role: managerRole.id,
        store: leafStore.id,
        password
      },
      {
        name: 'Menadzer Test 1',
        username: 'menadzer-test-1',
        role: managerRole.id,
        store: leafStore.id,
        password
      },
      {
        name: 'Menadzer Delete 1',
        username: 'menadzer-delete-1',
        role: managerRole.id,
        store: leafStore.id,
        password
      },
      {
        name: 'Radnik Test 1',
        username: 'radnik-test-1',
        role: employeeRole.id,
        store: leafStore.id,
        password
      },
      {
        name: 'Radnik Test 2',
        username: 'radnik-test-2',
        role: employeeRole.id,
        store: leafStore.id,
        password
      },
      {
        name: 'Radnik Test 3',
        username: 'radnik-test-3',
        role: employeeRole.id,
        store: leafStore.id,
        password
      },
      {
        name: 'Glavni Radnik',
        username: 'glavni-radnik',
        role: employeeRole.id,
        store: mainStore.id,
        password
      },
    ]
    await User.create(usersData)
  })

  after(async () => {
    await drop()
  })

  describe('create employee', () => {
    it('should not create employee, not authorized', async () => {
      try {
        const newEmployee = {
          name: 'Radnik 1',
          username: 'radnik1',
          password: DEFAULT_USER_PASSWORD,
          store: leafStore.id
        }
        const response = await chai.request(app)
          .post(APP_ROUTES.EMPLOYEE)
          .set({
            Authorization: ''
          })
          .send(newEmployee)

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

    it('should not create employee, manager has no permission', async () => {
      try {
        const newEmployee = {
          name: 'Radnik 1',
          username: 'radnik1',
          password: DEFAULT_USER_PASSWORD,
          store: mainStore.id
        }
        const manager = await User.findOne({ username: 'menadzer-radnje' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .post(APP_ROUTES.EMPLOYEE)
          .set({
            Authorization: `Bearer ${token}`
          })
          .send(newEmployee)

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

    it('should not create employee, employee has no permission', async () => {
      try {
        const newEmployee = {
          name: 'Radnik 1',
          username: 'radnik1',
          password: DEFAULT_USER_PASSWORD,
          store: mainStore.id
        }
        const employee = await User.findOne({ username: 'radnik-test-1' })
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .post(APP_ROUTES.EMPLOYEE)
          .set({
            Authorization: `Bearer ${token}`
          })
          .send(newEmployee)

        const { status, description } = errorCodesUtils.FORBIDDEN
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

    it('should create employee', async () => {
      try {
        const newEmployee = {
          name: 'Radnik 1',
          username: 'radnik1',
          password: DEFAULT_USER_PASSWORD,
          store: leafStore.id
        }
        const manager = await User.findOne({ username: 'menadzer-radnje' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .post(APP_ROUTES.EMPLOYEE)
          .set({
            Authorization: `Bearer ${token}`
          })
          .send(newEmployee)

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, newEmployee.username)
        assert.equal(data.name, newEmployee.name)
        assert.equal(data.store, newEmployee.store)
      } catch (err) {
        console.log(err.stack)
        expect(err).to.not.exist
        throw err
      }
    })
  })

  describe('update employee', () => {

    let employee

    before(async () => {
      employee = await User.findOne({
        username: 'radnik-test-1'
      })
    })

    it('should not update employee, not authorized', async () => {
      try {
        const updateEmployee = {
          name: 'Radnik 1',
          username: 'radnik1',
          store: leafStore.id
        }
        const response = await chai.request(app)
          .put(`${APP_ROUTES.EMPLOYEE}/${employee.id}`)
          .set({
            Authorization: ''
          })
          .send(updateEmployee)

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

    it('should not update employee, manager has no permission', async () => {
      try {
        const updateEmployee = {
          name: 'Radnik 1',
          username: 'radnik1',
          store: mainStore.id
        }
        const manager = await User.findOne({ username: 'menadzer-radnje' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .put(`${APP_ROUTES.EMPLOYEE}/${employee.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })
          .send(updateEmployee)

        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
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

    it('should not update employee, employee has no permission', async () => {
      try {
        const updateEmployee = {
          name: 'Radnik 1',
          username: 'radnik1',
          store: mainStore.id
        }
        const employee = await User.findOne({ username: 'radnik-test-1' })
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .put(`${APP_ROUTES.EMPLOYEE}/${employee.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })
          .send(updateEmployee)

        const { status, description } = errorCodesUtils.FORBIDDEN
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

    it('should update employee', async () => {
      try {
        const updateEmployee = {
          name: 'Radnik 1',
          username: 'radnik1',
          store: leafStore.id
        }
        const manager = await User.findOne({ username: 'menadzer-radnje' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .put(`${APP_ROUTES.EMPLOYEE}/${employee.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })
          .send(updateEmployee)

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, updateEmployee.username)
        assert.equal(data.name, updateEmployee.name)
        assert.equal(data.store, updateEmployee.store)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

  })

  describe('create manager', () => {
    it('should not create manager, not authorized', async () => {
      try {
        const newManager = {
          name: 'Menadzer 1',
          username: 'menadzer1',
          password: DEFAULT_USER_PASSWORD,
          store: leafStore.id
        }
        const response = await chai.request(app)
          .post(APP_ROUTES.MANAGER)
          .set({
            Authorization: ''
          })
          .send(newManager)

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

    it('should not create manager, manager has no permission', async () => {
      try {
        const newManager = {
          name: 'Menadzer 1',
          username: 'menadzer1',
          password: DEFAULT_USER_PASSWORD,
          store: mainStore.id
        }
        const manager = await User.findOne({ username: 'menadzer-radnje' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .post(APP_ROUTES.MANAGER)
          .set({
            Authorization: `Bearer ${token}`
          })
          .send(newManager)

        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
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

    it('should not create manager, employee has no permission', async () => {
      try {
        const newManager = {
          name: 'Menadzer 1',
          username: 'menadzer1',
          password: DEFAULT_USER_PASSWORD,
          store: leafStore.id
        }
        const employee = await User.findOne({ username: 'radnik-test-2' })
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .post(APP_ROUTES.MANAGER)
          .set({
            Authorization: `Bearer ${token}`
          })
          .send(newManager)

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

    it('should create manager', async () => {
      try {
        const newManager = {
          name: 'Menadzer 1',
          username: 'menadzer1',
          password: DEFAULT_USER_PASSWORD,
          store: leafStore.id
        }
        const manager = await User.findOne({ username: 'menadzer-radnje' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .post(APP_ROUTES.MANAGER)
          .set({
            Authorization: `Bearer ${token}`
          })
          .send(newManager)

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, newManager.username)
        assert.equal(data.name, newManager.name)
        assert.equal(data.store, newManager.store)
      } catch (err) {
        console.log(err.stack)
        expect(err).to.not.exist
        throw err
      }
    })
  })

  describe('update manager', () => {

    let manager

    before(async () => {
      manager = await User.findOne({
        username: 'menadzer-test-1'
      })
    })

    it('should not update manager, not authorized', async () => {
      try {
        const updateManager = {
          name: 'Menadzer 1',
          username: 'menadzer1',
          store: leafStore.id
        }
        const response = await chai.request(app)
          .put(`${APP_ROUTES.MANAGER}/${manager.id}`)
          .set({
            Authorization: ''
          })
          .send(updateManager)

        expect(response.status).to.equal(401)
        const { error } = response
        const errorText = JSON.parse(error.text)
        expect(errorText.message).to.equal(errorCodesUtils.AUTHENTICATION_FAILED.description)
      } catch (err) {
        console.log(err.stack)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should not update manager, manager has no permission', async () => {
      try {
        const updateManager = {
          name: 'Menadzer 1',
          username: 'menadzer1',
          store: mainStore.id
        }
        const manager = await User.findOne({ username: 'menadzer-radnje' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .put(`${APP_ROUTES.MANAGER}/${manager.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })
          .send(updateManager)

        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
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

    it('should not update manager, employee has no permission', async () => {
      try {
        const updateManager = {
          name: 'Menadzer 1',
          username: 'menadzer1',
          store: mainStore.id
        }
        const employee = await User.findOne({ username: 'radnik-test-2' })
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .put(`${APP_ROUTES.MANAGER}/${employee.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })
          .send(updateManager)

        const { status, description } = errorCodesUtils.FORBIDDEN
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

    it('should update manager', async () => {
      try {
        const updateManager = {
          name: 'Menadzer 1',
          username: 'menadzer1',
          store: leafStore.id
        }
        const manager = await User.findOne({ username: 'menadzer-radnje' })
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .put(`${APP_ROUTES.MANAGER}/${manager.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })
          .send(updateManager)

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, updateManager.username)
        assert.equal(data.name, updateManager.name)
        assert.equal(data.store, updateManager.store)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

  })

  describe('read employee', () => {

    let mainManager
    let manager
    let targetEmployee
    let mainEmployee

    before(async () => {
      mainManager = await User.findOne({
        username: 'glavni-menadzer'
      })

      manager = await User.findOne({
        username: 'menadzer-test-1'
      })

      targetEmployee = await User.findOne({
        username: 'radnik-test-2'
      })

      mainEmployee = await User.findOne({
        username: 'glavni-radnik'
      })
    })

    it('should not read employee, not authorized', async () => {
      try {
        const response = await chai.request(app)
          .get(`${APP_ROUTES.EMPLOYEE}/${targetEmployee.id}`)
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

    it('should not read employee, manager has no permission', async () => {
      try {
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`${APP_ROUTES.EMPLOYEE}/${mainEmployee.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })

        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
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

    it('should not read employee, employee has no permission', async () => {
      try {
        const employee = await User.findOne({ username: 'radnik-test-3' })
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .get(`${APP_ROUTES.EMPLOYEE}/${mainEmployee.id}`)
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

    it('should read an employee by the store employee', async () => {
      try {
        const employee = await User.findOne({ username: 'radnik-test-3' })
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .get(`${APP_ROUTES.EMPLOYEE}/${targetEmployee.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, targetEmployee.username)
        assert.equal(data.name, targetEmployee.name)
        assert.equal(data.store, targetEmployee.store)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should read employee by main manager', async () => {
      try {
        const token = await makeAccessToken(mainManager)

        manager.token = token

        const response = await chai.request(app)
          .get(`${APP_ROUTES.EMPLOYEE}/${targetEmployee.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, targetEmployee.username)
        assert.equal(data.name, targetEmployee.name)
        assert.equal(data.store, targetEmployee.store)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should read employee by store manager', async () => {
      try {
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`${APP_ROUTES.EMPLOYEE}/${targetEmployee.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, targetEmployee.username)
        assert.equal(data.name, targetEmployee.name)
        assert.equal(data.store, targetEmployee.store)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

  })

  describe('delete employee', () => {

    let mainManager
    let manager
    let targetEmployee
    let mainEmployee

    before(async () => {
      mainManager = await User.findOne({
        username: 'glavni-menadzer'
      })

      manager = await User.findOne({
        username: 'menadzer-test-1'
      })

      targetEmployee = await User.findOne({
        username: 'radnik-test-2'
      })

      mainEmployee = await User.findOne({
        username: 'glavni-radnik'
      })
    })

    it('should not delete employee, not authorized', async () => {
      try {
        const response = await chai.request(app)
          .delete(`${APP_ROUTES.EMPLOYEE}/${targetEmployee.id}`)
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

    it('should not delete employee, manager has no permission', async () => {
      try {
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .delete(`${APP_ROUTES.EMPLOYEE}/${mainEmployee.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })

        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
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

    it('should not delete employee, employee has no permission', async () => {
      try {
        const employee = await User.findOne({ username: 'radnik-test-3' })
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .delete(`${APP_ROUTES.EMPLOYEE}/${mainEmployee.id}`)
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

    it('should delete employee by main manager', async () => {
      try {
        const token = await makeAccessToken(mainManager)

        manager.token = token

        const response = await chai.request(app)
          .delete(`${APP_ROUTES.EMPLOYEE}/${targetEmployee.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, targetEmployee.username)
        assert.equal(data.name, targetEmployee.name)
        assert.equal(data.store, targetEmployee.store)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should delete employee by store manager', async () => {
      try {
        const employeeRole = await Role.getEmployeeRole()
        targetEmployee = await User.create(
          {
            name: 'Radnik Test 2',
            username: 'radnik-test-2',
            role: employeeRole.id,
            store: leafStore.id,
            password
          }
        )

        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .delete(`${APP_ROUTES.EMPLOYEE}/${targetEmployee.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, targetEmployee.username)
        assert.equal(data.name, targetEmployee.name)
        assert.equal(data.store, targetEmployee.store)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

  })

  describe('read manager', () => {

    let mainManager
    let manager
    let employee
    let storeManager

    before(async () => {
      mainManager = await User.findOne({
        username: 'glavni-menadzer'
      })

      manager = await User.findOne({
        username: 'menadzer-test-1'
      })

      storeManager = await User.findOne({
        username: 'menadzer1'
      })

      employee = await User.findOne({
        username: 'radnik-test-3'
      })
    })

    it('should not read manager, not authorized', async () => {
      try {
        const response = await chai.request(app)
          .get(`${APP_ROUTES.MANAGER}/${manager.id}`)
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

    it('should not read manager, manager has no permission', async () => {
      try {
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .get(`${APP_ROUTES.MANAGER}/${mainManager.id}`)
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

    it('should not read manager, employee has no permission', async () => {
      try {
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .get(`${APP_ROUTES.MANAGER}/${mainManager.id}`)
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

    it('should read manager by main manager', async () => {
      try {
        const token = await makeAccessToken(mainManager)

        manager.token = token

        const response = await chai.request(app)
          .get(`${APP_ROUTES.MANAGER}/${manager.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, manager.username)
        assert.equal(data.name, manager.name)
        assert.equal(data.store, manager.store)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should read manager by store manager', async () => {
      try {
        const token = await makeAccessToken(storeManager)

        storeManager.token = token

        const response = await chai.request(app)
          .get(`${APP_ROUTES.MANAGER}/${manager.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, manager.username)
        assert.equal(data.name, manager.name)
        assert.equal(data.store, manager.store)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

  })

  describe('delete manager', () => {

    let mainManager
    let manager
    let targetManager

    before(async () => {
      mainManager = await User.findOne({
        username: 'glavni-menadzer'
      })

      manager = await User.findOne({
        username: 'menadzer-test-1'
      })

      targetManager = await User.findOne({
        username: 'menadzer-radnje'
      })
    })

    // beforeEach(async () => {
    //   const managerRole = await Role.getManagerRole()
    //   await User.create([
    //     {
    //       name: 'Menadzer 1',
    //       username: 'menadzer-radnje',
    //       role: managerRole.id,
    //       store: leafStore.id,
    //       password
    //     }
    //   ])
    // })

    it('should not delete manager, not authorized', async () => {
      try {
        const response = await chai.request(app)
          .delete(`${APP_ROUTES.MANAGER}/${manager.id}`)
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

    it('should not delete manager, manager has no permission', async () => {
      try {
        const token = await makeAccessToken(manager)

        manager.token = token

        const response = await chai.request(app)
          .delete(`${APP_ROUTES.MANAGER}/${mainManager.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })

        const { status, description } = errorCodesUtils.STORE_FORBIDDEN
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

    it('should not delete manager, employee has no permission', async () => {
      try {
        const employee = await User.findOne({ username: 'radnik-test-3' })
        const token = await makeAccessToken(employee)

        employee.token = token

        const response = await chai.request(app)
          .delete(`${APP_ROUTES.EMPLOYEE}/${manager.id}`)
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

    it('should delete manager by main manager', async () => {
      try {
        const token = await makeAccessToken(mainManager)

        manager.token = token

        const response = await chai.request(app)
          .delete(`${APP_ROUTES.MANAGER}/${manager.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, manager.username)
        assert.equal(data.name, manager.name)
        assert.equal(data.store, manager.store)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

    it('should delete manager by store manager', async () => {
      try {
        const storeManager = await User.findOne({ username: 'menadzer1' })
        targetManager = await User.findOne({
          username: 'menadzer-delete-1'
        })

        const token = await makeAccessToken(storeManager)

        storeManager.token = token

        const response = await chai.request(app)
          .delete(`${APP_ROUTES.MANAGER}/${targetManager.id}`)
          .set({
            Authorization: `Bearer ${token}`
          })

        expect(response.status).to.equal(200)
        const { body } = response
        expect(body).to.have.property('data')
        const { data } = body
        assert.equal(data.username, targetManager.username)
        assert.equal(data.name, targetManager.name)
        assert.equal(data.store, targetManager.store)
      } catch (err) {
        console.log(err)
        expect(err).to.not.exist
        throw err
      }
    })

  })

})
