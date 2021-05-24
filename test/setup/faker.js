// Libs
const mongoose = require('mongoose')

// Utils
const { ROLES, RBAC } = require('../../src/utils/auth.utils')
const { COLLECTION_NAMES } = require('../../src/utils/constants')
const { insertStores } = require('../../src/utils/seed.utils')

// Models
const Role = mongoose.model(COLLECTION_NAMES.ROLES)

// Data
const rolesData = [
  {
    name: ROLES.MANAGER.NAME,
    code: ROLES.MANAGER.CODE,
    acl: [
      RBAC.CREATE_EMPLOYEE,
      RBAC.CREATE_MANAGER,
      RBAC.READ_EMPLOYEE,
      RBAC.READ_MANAGER,
      RBAC.UPDATE_EMPLOYEE,
      RBAC.UPDATE_MANAGER,
      RBAC.DELETE_MANAGER,
      RBAC.DELETE_EMPLOYEE,
      RBAC.EMPLOYEES_LIST,
      RBAC.MANAGERS_LIST
    ]
  },
  {
    name: ROLES.EMPLOYEE.NAME,
    code: ROLES.EMPLOYEE.CODE,
    acl: [
      RBAC.READ_EMPLOYEE,
      RBAC.EMPLOYEES_LIST
    ]
  }
]
const storeData = [
  {
    name: 'Srbija',
    children: [
      {
        name: 'Vojvodina',
        children: [
          {
            name: 'Severnobacki okrug',
            children: [
              {
                name: 'Subotica',
                children: [
                  {
                    name: 'Radnja 1'
                  }
                ]
              }
            ]
          },
          {
            name: 'Juznobacki okrug',
            children: [
              {
                name: 'Novi Sad',
                children: [
                  {
                    name: 'Detelinara',
                    children: [
                      {
                        name: 'Radnja 2'
                      },
                      {
                        name: 'Radnja 3'
                      }
                    ]
                  },
                  {
                    name: 'Liman',
                    children: [
                      {
                        name: 'Radnja 4'
                      },
                      {
                        name: 'Radnja 5'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'Grad Beograd',
        children: [
          {
            name: 'Novi Beograd',
            children: [
              {
                name: 'Bezanija',
                children: [
                  {
                    name: 'Radnja 6'
                  }
                ]
              }
            ]
          },
          {
            name: 'Vracar',
            children: [
              {
                name: 'Neimar',
                children: [
                  {
                    name: 'Radnja 7'
                  }
                ]
              },
              {
                name: 'Crveni krst',
                children: [
                  {
                    name: 'Radnja 8'
                  },
                  {
                    name: 'Radnja 9'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]

/**
 * Insert roles
 * @returns {Array}
 */
exports.initRoles = async () => {
  // Insert roles
  return await Role.create(rolesData)
}

/**
 * Insert stores
 * @returns {Array}
 */
 exports.initStores = async () => {
  // Insert roles
  return await insertStores(storeData)
}
