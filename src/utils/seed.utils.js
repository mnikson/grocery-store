// Libs
const _ = require('lodash')

// Models
const { Store } = require('../models')

/**
 * Insert stores
 * @param {Array} storeData - Stores data
 * @returns {Array} - Stores
 */
const insertStores = async (storeData = []) => {
  if (storeData.length > 0) {
    const { stores } = initializeStore(storeData[0])
    return await Promise.all(_.map(stores.reverse(), async store => await store.save()))
  }
}

/**
 * Initialize store
 * @param {Object} store - Store
 * @param {Number} left - Left position
 * @param {Array} stores - Stores collection
 * @returns
 */
function initializeStore(store, left = 1, stores = []) {
  let right = left + 1
  const { children } = store

  _.forEach(children, child => {
    const list = initializeStore(child, right, stores)
    right = list.right
  });

  const newStore = new Store({
    name: store.name,
    left,
    right
  })

  stores.push(newStore)

  return {
    right,
    stores
  }
}

exports.insertStores = insertStores
