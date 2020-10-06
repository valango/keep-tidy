//  src/helpers.js -  helper functions for class and Vue.js mix-in.
'use strict'

const assert = require('assert-fine')
const Debug = require('./debug')
const noop = () => undefined

let seed = 0

const readOnly = (self, name, value) => {
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
 * Constructor code.
 * @param {string=} instanceTag     to override the default ownTag property.
 */
function initialize (instanceTag = undefined) {
  const classTag = this.constructor ? this.constructor.name : 'object'
  assert(!instanceTag || typeof instanceTag === 'string', `${instanceTag}.initialize: bad tag`)

  this.debugOn = function (yes = undefined) {
    if (yes === undefined) return this.debug && this.debug !== noop
    this.debug = yes ? Debug(this.ownTag, yes) : noop
    return this
  }
  this.debug = noop

  this.own = Object.create(null)
  readOnly(this, 'ownClass', classTag)
  readOnly(this, 'ownId', ++seed)
  readOnly(this, 'ownTag', instanceTag || (classTag + '#' + seed))

  this.$_Owner_handlers = []
}

/**
 * Unregister event handler.
 * @param {string} event
 * @param {Object=} emitter
 * @returns {this}
 */
function ownOff (event, emitter = undefined) {
  const array = this.$_Owner_handlers

  for (let i = array.length; --i >= 0;) {
    const [ev, em, fn, off] = array[i]
    if ((event && ev !== event) || (emitter && em !== emitter)) continue
    em[off](ev, fn)
    array.splice(i, 1)
  }
  return this
}

const guessEmitterAPI = (emitter) => {
  for (const [a, b] of [['addEventListener', 'removeEventListener'], ['$on', '$off']]) {
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
 * @param {[string, string] | undefined} emitter API method names.
 * @returns {this}
 */
function ownOn (event, handler, emitter, methods = undefined) {
  const api = methods || guessEmitterAPI(emitter)
  let fn = handler, hn

  if (typeof fn !== 'function') {
    assert(typeof (hn = this[fn]) === 'function', `ownOn('%s', '%s') - not a function`)
    fn = (...args) => hn.apply(this, args)
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
  for (const key of Object.keys(this.own)) {
    const value = this.own[key]
    if (value && typeof value === 'object' &&
      typeof value.dispose === 'function') {
      value.dispose()
    }
    delete this.own[key]
  }

  this.ownOff(undefined, undefined)
}

module.exports = { dispose, initialize, ownOff, ownOn }
