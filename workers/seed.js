// Libs
const _ = require('lodash')

// App
require('../src/app')

// Models
const {
  Role,
  Store,
  User
} = require('../src/models')

// Utils
const {
  ROLES,
  RBAC,
  makePasswordHash
} = require('../src/utils/auth.utils')
const { insertStores } = require('../src/utils/seed.utils')

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
      RBAC.MANAGERS_LIST,
      RBAC.STORE_MANAGERS,
      RBAC.STORES_MANAGERS
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

const MANAGER_STORES_COUNT = 8

/**
 * Seed data
 */
async function seedData() {
  console.log('=== Seeding has been started ====')

  console.log('-> Erase the database')
  // Clear data if exists
  await Role.deleteMany({})
  await Store.deleteMany({})
  await User.deleteMany({})

  console.log('-> Data has been erased')

  console.log('-> Start inserting a data')

  // Insert roles
  const roles = await Role.create(rolesData)

  // Save stores as a nested set
  const stores = await insertStores(storeData)

  const managerRole = _.find(roles, role => role.code === ROLES.MANAGER.CODE)
  const employeeRole = _.find(roles, role => role.code === ROLES.EMPLOYEE.CODE)

  const password = makePasswordHash('passwordpassword')
  const randomManagerStore = _.random(1, MANAGER_STORES_COUNT)
  const randomEmployeeStore = _.random(MANAGER_STORES_COUNT, _.size(stores))
  const managers = []
  const employees = []

  // init managers
  while (_.size(managers) < 10) {
    const count = _.size(managers) + 1;

    managers.push({
      name: `Menadzer ${count}`,
      role: managerRole.id,
      password,
      store: stores[randomManagerStore].id,
      username: `manager${count}`
    })
  }

  // init employees
  while (_.size(employees) < 10) {
    const count = _.size(employees) + 1;

    employees.push({
      name: `Radnik ${count}`,
      role: employeeRole.id,
      password,
      store: stores[randomEmployeeStore].id,
      username: `employee${count}`
    })
  }

  // save user data
  const users = [
    ...managers,
    ...employees
  ]

  await User.create(users)

  console.log('-> Data inserts are done')

  console.log('=== Seeding ended ===')

  process.exit()
}

(async () => {
  await seedData();
})().catch(e => {
  // Seeding error
  console.log(e.stack)
})
