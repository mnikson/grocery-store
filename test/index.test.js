// Run the application
const app = require('../src/app')

const { drop, disconnect } = require('./setup/database')
const { initRoles, initStores } = require('./setup/faker')

describe('Happy hacking :)', () => {

  before(async () => {
    await drop()
    // init data
    await initRoles()
    await initStores()
  })

  after(async () => {
    await disconnect()
  })

  // API
  require('./api')

  // Handlers
  require('./handlers')
})
// })
