# keep-tidy
[![Build Status](https://travis-ci.org/valango/keep-tidy.svg?branch=master)](https://travis-ci.org/valango/keep-tidy)
[![Code coverage](https://img.shields.io/codecov/c/gh/valango/keep-tidy?label=codecov&logo=codecov)](https://codecov.io/gh/valango/keep-tidy)

A tiny ES5 base class featuring clean disposal of bound resources.
It also provides a simple API for easier debugging and diagnostics.
All this works in both back-end and front-end environments.

Processing DOM events or similar in OO code implies correct set-up and releasing of event handlers.
Also, cross-referenced class instances and other objects need special care to prevent
the dreaded memory leaks. The _**`TidyOwner`**_ base class interface of
_**`own`**_ property and _**`dispose()`**_ method may save you from writing boring boilerplate code
and possibly making mistakes in those cases.

## Installation
`  npm install -S keep-tidy`<br />or<br />`  yarn add keep-tidy`

## Usage
```javascript
  import Tidy from 'keep-tidy'

  class A extends Tidy {
    resizeHandler() { 
      this.debug('resized')           //  console output like: 'A#2 resized +0ms 3'
    }
  }

  let superItem = new A() 
  //  Nested structures are OK.
  superItem.own.item1 = new A().ownOn('resize', 'resizeHandler', window).debugOn(true)
  superItem.own.somethingElse = [1, 2, 3]
  //  Lots of interecting things in between...
  superItem.dispose()                             //  Tidy up everything now...
  superItem = undefined                           //  ... and yes, this is no C++ ;)
```

There is also lightweight debugging and assertion helpers available even if you won't
use Javascript classes at all.

## API
The package exports the following API:

* **`assert`** - [assertion package](https://github.com/valango/assert-fine) used internally;
* [**`debugMe`**](#debugging) - a debug function factory; 
* [**`debug`**](#debugging) - underlying [debug package](https://github.com/visionmedia/debug);
* [**`TidyOwner`**](#baseclass) - the base class constructor, also available as default export;

Some parts can be loaded individually: `'owner-class/debug'` and `'owner-class/helpers'`.

### Baseclass
`constructor TidyOwner([classNameOverride : string])`

When using this baseclass, you'll avoid writing boilerplate code for releasing event handlers
and freeing other resources. Its interface consists of:
   * **`assertHook`**<br />a class (not instance) method - a convenience shortcut for 
   [`assert.hook()`](https://github.com/valango/assert-fine).
   * **`debug`**`(...)`<br />see [debugging](#debugging) for details.
   * **`debugOn`**`([*]): *`<br />for re-generating the `debug` method and returning _`this`_
   for chaining, if argument supplied; otherwise returns _boolean_ showing if debugging is enabled.
   * **`dispose`**`()`<br />call this to free up all bound resources.
   Base class method cleans the _**`own`**_ container, firing _`dispose`_ method of every
   object instance having it. Then it _un-registers all handlers_ set by _`ownOn`_ method.
   * **`ownOff`**`(event= : string, emitter= : Object) : this`<br />
   un-registers handlers registered for matching (event, emitter) pairs.
   It is called by dispose(), so in most cases you don't need to call it explicitly.
   * **`ownOn`**`(event : string, handler, emitter, api=) : this`<br />
   registers _`event`_ _`handler`_ with _`emitter`_ object.
   If emitter API differs from `addEventListener/removeEventListener` or `$on/$off` or `on/off`,
   then you need explicitly define the API, like `['listenTo', 'ignore']`.
   The _`handler`_ parameter can be instance method name or a function.
   * **`own`**`: Object`<br />a keyed container for private data, that should be gracefully cleaned up.
   * **`ownClass`**`: string`<br />class name (read-only).
   * **`ownId`**`: number`<br />globally unique class instance number(read-only).
   * **`ownTag`**`: string`<br />is set to _`ownClass`_`+ '#' +`_`ownId`_ (read-only).
   
Assigning a value to any instance property will throw `TypeError`.

### Debugging
Debugging machinery uses [debug](https://github.com/visionmedia/debug])
NPM package and is available only in development mode. In _**production mode**_ all its API
methods will be just empty functions.

**`debugMe`**`( tag: string, [yesNo : boolean]) : {function(...)}`<br />
exported from the main package is factory function returning the actual debug function.

The same factory function is default export from the sub-package (see example below).

**Debugging plain javascript code:**
```javascript
  const D = require('keep-tidy/debug')
  const myDebug = D(main.js, true), { debug } = D

  myDebug('try(%d, %o)', 1, 2, 3)       // --> 'main.js try(1, 2) +0ms 3'
  debug.enable('*')
  debug('natively')('yay!')             // --> 'natively yay! +0ms'
```

## Compatibility

The package should be ECMAScript 2015 and it should run virtually anywhere.
If you find any issues, please do not hesitate to report.
