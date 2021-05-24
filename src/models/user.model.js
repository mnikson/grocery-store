/**
 * @file user.model
 * @description User model
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Libs
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const _ = require('lodash')

// Utils
const { COLLECTION_NAMES } = require('../utils/constants')
const { makePasswordHash } = require('../utils/auth.utils')

const { Schema } = mongoose

// Schema
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: Schema.ObjectId,
    ref: COLLECTION_NAMES.ROLES
  },
  token: {
    type: String
  },
  store: {
    type: Schema.ObjectId,
    ref: COLLECTION_NAMES.STORES
  },
  password: {
    type: String,
    required: true,
    default: ''
  },
  username: {
    type: String,
    required: true
  }
})

/**
 * Virtual properties
 */
UserSchema.virtual('hash_password')
  .set(password => {
    this._password = password;
    this.password = makePasswordHash(password);
  })
  .get(() => {
    return this.password;
  })

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the username and passwords are the same
   * @param {String} password - Password
   * @return {Boolean} - Authenticated
   * @api public
   */

  authenticate: function(password) {
    return bcrypt.compareSync(password, this.password);
  }
}

UserSchema.set('toObject', { virtuals: true })
UserSchema.options.toObject.transform = (doc, ret) => {
  // remove password
  delete ret.password;

  return ret;
}

const UserModel = mongoose.model(COLLECTION_NAMES.USERS, UserSchema)

 module.exports = UserModel
