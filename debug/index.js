'use strict'
var api

if (process.env.NODE_ENV !== 'production') {
  api = require('./debug')
} else {
  //  eslint-disable-next-line
  var noop = function () {
  }
  //  eslint-disable-next-line
  api = function () {
    return noop
  }
  api.debug = noop
}

module.exports = api
