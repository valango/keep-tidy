//  src/helpers.js -  helper functions for class and Vue.js mix-in.
'use strict'

var assert = require('assert-fine')
var Debug = require('./debug')
var noop = function () {
}

//  Event handler registering / un-registering API-s (exported and can be changed).
var emitterAPI = [
  ['on', 'off'],
  ['addEventListener', 'removeEventListener'],
  ['$on', '$off']
]

var seed = 0

var readOnly = function (self, name, value) {
  Object.defineProperty(self, name, { enumerable: true, value })
}

/**
 * @interface IOwnerClass
 * @property {function(...)} debug    function, not method;
 * @property {function(*):*} debugOn  control or query, if debug output is enabled;
 * @property {Object} own             a keyed collection of subordinate object instances;
 * @property {string} ownClass        class instance or Vue.js component name;
 * @property {number} ownId           an unique numeric instance id;
 * @property {string} ownTag          <ownClass> + '#' + <ownId> for debugging or tracing.
 */

/**
 * This function should be normally called from class constructor.
 *
 * @param {string=} className   - to override the default ownTag property.
 */
function initialize (className = undefined) {
  var classTag = this.constructor ? this.constructor.name : 'object'

  if (className) {
    assert(typeof className === 'string', `${classTag}.initialize: bad className`)
    classTag = className
  }
  this.debugOn = function (yes = undefined) {
    if (yes === undefined) return this.debug && this.debug !== noop
    this.debug = yes ? Debug(this.ownTag, yes) : noop
    return this
  }
  this.debug = noop

  // this.own = Object.create(null)
  readOnly(this, 'own', Object.create(null))
  readOnly(this, 'ownClass', classTag)
  readOnly(this, 'ownId', ++seed)
  readOnly(this, 'ownTag', classTag + '#' + seed)

  this.$_Owner_handlers = []
}

/**
 * Unregister event handler.
 * @param {string} event
 * @param {Object=} emitter
 * @returns {this}
 */
function ownOff (event, emitter = undefined) {
  var array = this.$_Owner_handlers

  for (var i = array.length; --i >= 0;) {
    var [ev, em, fn, off] = array[i]
    if ((event && ev !== event) || (emitter && em !== emitter)) continue
    em[off](ev, fn)
    array.splice(i, 1)    // Todo: delete contents instead of array elements.
  }
  return this
}

var guessEmitterAPI = function (emitter) {
  for (var [a, b] of exports.emitterAPI) {
    if (typeof emitter[a] === 'function' && typeof emitter[b] === 'function') {
      return [a, b]
    }
  }
}

/**
 * Register event handler.
 * @param {string} event
 * @param {string|function} handler or instance method name.
 * @param {Object} emitter
 * @param {[string, string] | undefined} methods - emitter API method names.
 * @returns {this}
 */
function ownOn (event, handler, emitter, methods = undefined) {
  var api = methods || guessEmitterAPI(emitter)
  var fn = handler, hn

  if (typeof fn !== 'function') {
    assert(typeof (hn = this[fn]) === 'function', `ownOn('%s', '%s') - not a function`)
    var self = this

    fn = function () {
      return hn.apply(self, arguments)
    }
  }
  assert(api, `onOwn('${event}'): unknown API`)
  emitter[api[0]](event, fn)
  this.$_Owner_handlers.push([event, emitter, fn, api[1]])
  return this
}

/**
 * Method to be called before the instance is destroyed.
 */
function dispose () {
  for (var key of Object.keys(this.own)) {
    var value = this.own[key]
    if (value && typeof value === 'object' &&
      typeof value.dispose === 'function') {
      value.dispose()
    }
    delete this.own[key]
  }

  this.ownOff(undefined, undefined)
}

exports = module.exports = { dispose, emitterAPI, initialize, ownOff, ownOn }
