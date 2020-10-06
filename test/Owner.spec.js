'use strict'
const Own = require('../').OwnerClass

let on = [], off = [], a

const em0 = {
  'on': (ev, fn) => on.push({ ev, fn }),
  'off': (ev, fn) => off.push({ ev, fn })
}

const em1 = {
  'addEventListener': (ev, fn) => on.push({ ev, fn }),
  'removeEventListener': (ev, fn) => off.push({ ev, fn })
}

const em2 = {
  '$on': (ev, fn) => on.push({ ev, fn }),
  '$off': (ev, fn) => off.push({ ev, fn })
}

class A extends Own {
  constructor (name = undefined) {
    super(name)
    this.calls = []
  }

  handler () {
    this.calls.push(Array.from(arguments))
  }
}

it('should construct', () => {
  expect(new A('Aa').ownTag).toBe('Aa')
  expect((a = new A()).ownTag).toBe('A#2')
  expect(a.debugOn()).toBe(false)
  expect(a.debug('a')).toBe(undefined)
  a.own.child = new A()
  a.own.num = 22
})

it('should have immutable properties', () => {
  expect(() => (a.ownClass = 'Other')).toThrow(TypeError)
  expect(() => (a.ownId = 100)).toThrow(TypeError)
  expect(() => (a.ownTag = 'a#4')).toThrow(TypeError)
})

it('should register', () => {
  const fn = () => 0
  a.ownOn('ev0', 'handler', em0).ownOn('ev1', fn, em1).ownOn('ev2', fn, em2)
  expect(on[0].ev).toBe('ev0')
  expect(on[0].fn).not.toBe(fn)
  expect(on[1].ev).toBe('ev1')
  expect(on[1].fn).toBe(fn)
  expect(on[2].ev).toBe('ev2')
  expect(on[2].fn).toBe(fn)
  on[0].fn(3, 5, 6)
  expect(a.calls).toEqual([[3, 5, 6]])
})

it('should ignore unfit un-register', () => {
  a.ownOff('evz').ownOff('ev1', a)
  expect(off.length).toBe(0)
})

it('should un-register selectively', () => {
  a.ownOff('ev2', em2)
  expect(off.length).toBe(1)
})

it('should re-generate debug method', () => {
  let f = a.debug
  expect(a.debugOn(true)).toBe(a)
  expect(a.debug).not.toBe(f)
})

it('should dispose', () => {
  off = []
  a.dispose()
  expect(Object.keys(a.own).length).toBe(0)
  expect(off.length).toBe(2)
})
