/**
 * @file store.model
 * @description Store model
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Libs
const mongoose = require('mongoose')
const AppError = require('../utils/app-error.utils')

// Utils
const { COLLECTION_NAMES } = require('../utils/constants')
const errorCodes = require('../utils/error-codes.utils')

const { Schema } = mongoose

const StoreSchema = Schema({
  name: {
    type: String,
    required: true
  },
  left: Number,
  right: Number,
  parent: {
    type: Schema.ObjectId,
    ref: COLLECTION_NAMES.STORES
  }
})

/**
 * Methods
 */
StoreSchema.methods = {

  /**
   * Get descendant stores
   * @returns {Array} - Stores
   */
  getDescendants: async function() {
    return await StoreModel.find({
      left: { $gte: this.left },
      right: { $gte: this.right }
    })
  }
}

/**
 * Static
 */
StoreSchema.statics = {

  /**
   * Check whether a user has access to the store
   * @param {Object} originStore - Origin store
   * @param {String} storeId - Target store
   * @returns {Boolean} - Has access
   */
  userHasAccess: async (originStore = {}, storeId) => {
    const store = await StoreModel.findOne({
      _id: storeId,
      left: {
        $gte: originStore.left
      },
      right: {
        $lte: originStore.right
      }
    })

    if (!store) {
      throw new AppError(errorCodes.STORE_FORBIDDEN)
    }

    return true
  }

}

const StoreModel = mongoose.model(COLLECTION_NAMES.STORES, StoreSchema)

module.exports = StoreModel
