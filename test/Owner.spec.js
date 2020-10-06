'use strict'
const Own = require('../').OwnerClass

let on = [], off = [], a

const em1 = {
  '$on': (ev, fn) => on.push({ ev, fn }),
  '$off': (ev, fn) => off.push({ ev, fn })
}

class A extends Own {
  constructor (name = undefined) {
    super(name)
    this.count = 0
  }

  handler () {
    ++this.count
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
  a.ownOn('ev1', 'handler', em1).ownOn('ev1', fn, em1).ownOn('ev2', fn, em1)
  expect(on[0].ev).toBe('ev1')
  expect(on[0].fn).not.toBe(fn)
  expect(on[1].ev).toBe('ev1')
  expect(on[1].fn).toBe(fn)
  expect(on[2].ev).toBe('ev2')
  expect(on[2].fn).toBe(fn)
  on[0].fn()
  expect(a.count).toBe(1)
})

it('should ignore unfit un-register', () => {
  a.ownOff('evz').ownOff('ev1', a)
  expect(off.length).toBe(0)
})

it('should un-register selectively', () => {
  a.ownOff('ev2', em1)
  expect(off.length).toBe(1)
  off = []
})

it('should re-generate debug method', () => {
  let f = a.debug
  expect(a.debugOn(true)).toBe(a)
  expect(a.debug).not.toBe(f)
})

it('should dispose', () => {
  a.dispose()
  expect(Object.keys(a.own).length).toBe(0)
  expect(off.length).toBe(2)
})
