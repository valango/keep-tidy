'use strict'

var debug = require('debug')

//  Todo: re-think the masking.
var noop = function () {
}
var _mask = process.env.DEBUG
var _enabled = _mask

var factory = function (signature, yes) {
  var func = yes === false ? noop : factory.debug(signature)
  if (yes === true) func.enabled = true
  return func
}

//  You may change this property, e.g. for testing.
factory.debug = debug

Object.defineProperty(factory, 'enabled', {
  enumerable: true,
  get () {
    return _enabled
  },
  set (v) {
    _enabled = v
    if (v) {
      _enabled = v === true ? _mask || '*' : v
      factory.debug.enable(_enabled)
    } else {
      factory.debug.disable()
    }
  }
})

module.exports = factory
