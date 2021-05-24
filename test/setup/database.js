// Libs
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

/**
 * Drop collection
 * @param {String} name
 * @returns {Promise}
 */
exports.dropCollection = (name) => {
  return new Promise((resolve, reject) => {
    mongoose.connection.dropCollection(name, (err, result) => {
      // if (err) reject(err)
      // console.log(`${name} dropped`)
      resolve(result)
    })
  })
}

/**
 * Drop collections
 *
 * @param {Function} done Callback function
 */
 exports.drop = async () => {
  const db = mongoose.connection

  if (!db || !db.collections) {
    return Promise.reject('Database connection failed')
  }

  // // This is faster then dropping the database
  // const collections = Object.keys(db.collections)

  // for (const collection of collections) {
  //   await dropCollection(collection)
  // }
  db.dropDatabase()
}

/**
 * Disconnect database connection
 */
 exports.disconnect = () => {
  return new Promise((resolve) => {
    mongoose.disconnect(() => {
      mongoose.models = {};
      mongoose.modelSchemas = {};
      mongoose.connection.close();

      resolve()
    });
  })
}
