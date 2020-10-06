'use strict'

//  OwnerClass constructor is also the default export.
exports = module.exports = require('./Owner')

exports.assert = require('assert-fine')   //  Assert package used internally.
exports.debugMe = require('./debug')      //  Debug function factory.
exports.debug = exports.debugMe.debug     //  Native `debug` package.
exports.OwnerClass = exports
