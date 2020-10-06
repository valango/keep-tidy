//  src/Owner   --  a helpful base class.
'use strict'

var assert = require('assert-fine')
var { dispose, initialize, ownOff, ownOn } = require('./helpers')

/**
 * @class OwnerClass
 * @implements {IOwnerClass}
 */
function TidyOwner (className) {
  initialize.call(this, className)
}

TidyOwner.prototype.dispose = dispose
TidyOwner.prototype.ownOn = ownOn
TidyOwner.prototype.ownOff = ownOff
TidyOwner.assertionHook = assert.hook

module.exports = TidyOwner
