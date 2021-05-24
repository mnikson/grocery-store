/**
 * @file role.model
 * @description Role model
 * @author Nikola Miljkovic <mnikson@gmail.com>
 */

// Libs
const mongoose = require('mongoose')
const { ROLES } = require('../utils/auth.utils')
const { COLLECTION_NAMES } = require('../utils/constants')

// Schema
const RoleSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  acl: {
    type: Array,
    default: []
  }
})

/**
 * Methods
 */
RoleSchema.statics = {

  /**
   * Get employee role
   * @returns {Promise} - Role
   */
  getEmployeeRole: async () => {
    return RoleModel.findOne({
      code: ROLES.EMPLOYEE.CODE
    })
  },

  /**
   * Get manager role
   * @returns {Promise} - Role
   */
   getManagerRole: async () => {
    return RoleModel.findOne({
      code: ROLES.MANAGER.CODE
    })
  }
}

const RoleModel = mongoose.model(COLLECTION_NAMES.ROLES, RoleSchema)

module.exports = RoleModel
