//  src/Owner   --  a helpful base class.
'use strict'

var assert = require('assert-fine')
var h = require('./helpers')

/**
 * @class OwnerClass
 * @implements {IOwnerClass}
 */
function TidyOwner (className) {
  h.initialize.call(this, className)
}

TidyOwner.prototype.dispose = h.dispose
TidyOwner.prototype.ownOn = h.ownOn
TidyOwner.prototype.ownOff = h.ownOff
TidyOwner.assertionHook = assert.hook

module.exports = TidyOwner
