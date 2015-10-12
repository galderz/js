var _ = require("./underscore");

function existy(x) { return x != null }

function truthy(x) { return (x !== false) && existy(x) }

function validator(message, fun) {
  var f = function(/* args */) {
    return fun.apply(fun, arguments);
  };

  f['message'] = message;
  return f;
}

function cat() {
  var head = _.first(arguments);
  if (existy(head))
    return head.concat.apply(head, _.rest(arguments));
  else
    return [];
}

function construct(head, tail) {
  return cat([head], _.toArray(tail));
}

function partial1(fun, arg1) {
  return function(/* args */) {
    var args = construct(arg1, arguments);
    return fun.apply(fun, args);
  };
}

function mapcat(fun, coll) {
  return cat.apply(null, _.map(coll, fun));
}

function condition1(/* validators */) {
  var validators = _.toArray(arguments);

  return function(fun, arg) {
    var errors = mapcat(function(isValid) {
      return isValid(arg) ? [] : [isValid.message];
    }, validators);

    if (!_.isEmpty(errors))
      throw new Error(errors.join(", "));

    return fun(arg);
  };
}

function dispatch(/* funs */) {
  var funs = _.toArray(arguments);
  var size = funs.length;

  return function(target /*, args */) {
    var ret = undefined;
    var args = _.rest(arguments);

    for (var funIndex = 0; funIndex < size; funIndex++) {
      var fun = funs[funIndex];
      ret = fun.apply(fun, construct(target, args));

      if (existy(ret)) return ret;
    }

    return ret;
  };
}

function logError(f) {
  try {
    f.apply()
  } catch (e) {
    console.log(e);
  }
}

function pipeline(seed /*, args */) {
  return _.reduce(_.rest(arguments),
                  function(l,r) { return r(l); },
                  seed);
}

function doWhen(cond, action) {
  if(truthy(cond))
    return action();
  else
    return undefined;
}

function invoker (NAME, METHOD) {
  return function(target /* args ... */) {
    if (!existy(target)) fail("Must provide a target");

    var targetMethod = target[NAME];
    var args = _.rest(arguments);

    return doWhen((existy(targetMethod) && METHOD === targetMethod), function() {
      return targetMethod.apply(target, args);
    });
  };
}

var str = dispatch(invoker('toString', Array.prototype.toString),
                   invoker('toString', String.prototype.toString));

function isIndexed(data) {
  return _.isArray(data) || _.isString(data);
}

function nth(a, index) {
  if (!_.isNumber(index)) fail("Expected a number as the index");
  if (!isIndexed(a)) fail("Not supported on non-indexed type");
  if ((index < 0) || (index > a.length - 1))
    fail("Index value is out of bounds");

  return a[index];
}

function second(a) {
  return nth(a, 1);
}

function always(VALUE) {
  return function() {
    return VALUE;
  };
}

function fail(thing) {
  throw new Error(thing);
}

function isEven(n) { return (n%2) === 0 }

function note(thing) {
  console.log(["NOTE:", thing].join(' '));
}

function deepClone(obj) {
  if (!existy(obj) || !_.isObject(obj))
    return obj;

  var temp = new obj.constructor();
  for (var key in obj)
    if (obj.hasOwnProperty(key)) // to ensure that fields from prototype are not copied
      temp[key] = deepClone(obj[key]);

  return temp;
}

var zero = validator("cannot be zero", function(n) { return 0 === n });
var number = validator("arg must be a number", _.isNumber);

function sqr(n) {
  if (!number(n)) throw new Error(number.message);
  if (zero(n))    throw new Error(zero.message);

  return n * n;
}

function complement(PRED) {
  return function() {
    return !PRED.apply(null, _.toArray(arguments));
  };
}

function isEven(n) { return (n%2) === 0 }

var isOdd = complement(isEven);

///////////////////////////////////////////////////////////////////////////////

// No need to create a specialized LazyChain type. Instead, a lazy chain is
// whatever is returned from a function lazy Chain responding to .invoke and
// .force.
// That the chain array is private slightly complicates the ability to chain
// lazy chains with other lazy chains. However, to handle this condition
// requires a change to force to identify and feed the result of one lazy
// chain to the next.
function lazyChain(obj) {
  var calls = [];

  return {
    invoke: function(methodName /* args */) {
      var args = _.rest(arguments);

      calls.push(function(target) {
        var meth = target[methodName];

        return meth.apply(target, args);
      });

      return this;
    },
    force:  function() {
      return _.reduce(calls, function(ret, thunk) {
        return thunk(ret);
      }, obj);
    }
  };
}

var lazyOp = lazyChain([2,1,3])
    .invoke('concat', [7,7,8,9,0])
    .invoke('sort');
console.log(lazyOp.force());
//=> [0, 1, 2, 3, 7, 7, 8, 9]

function deferredSort(ary) {
  return lazyChain(ary).invoke('sort');
}

var deferredSorts = _.map([[2,1,3], [7,7,1], [0,9,5]], deferredSort);
console.log(deferredSorts);
//=> [<thunk>, <thunk>, <thunk>]

// Naturally, I’d like to execute each thunk, but since I’m factoring to
// functions, I’d prefer to encapsulate the method call:
function force(thunk) {
  return thunk.force();
}

console.log(_.map(deferredSorts, force));
//=> [[1,2,3], [1, 7, 7], [0, 5, 9]]

var validateTriples  = validator(
    "Each array should have three elements",
    function (arrays) {
      return _.every(arrays, function(a) {
        return a.length === 3;
      });
    });

var validateTripleStore = partial1(condition1(validateTriples), _.identity);


validateTripleStore([[2,1,3], [7,7,1], [0,9,5]]);
//=> [[2,1,3], [7,7,1], [0,9,5]])

logError(function () { validateTripleStore([[2,1,3], [7,7,1], [0,9,5,7,7,7,7,7,7]]) });
// Error: Each array should have three elements

function postProcess(arrays) {
  return _.map(arrays, second);
}

function processTriples(data) {
  return pipeline(data
      , JSON.parse
      , validateTripleStore
      , deferredSort
      , force
      , postProcess
      , invoker('sort', Array.prototype.sort)
      , str);
}

console.log(processTriples("[[2,1,3], [7,7,1], [0,9,5]]"));
//=> "1,7,9"

logError(function () { console.log(processTriples("[[2,1,3], [7,7,1], [0,9,5,7,7,7,7,7,7]]")) });
// Error: Each array should have three elements

// Uses jQuery
var reportDataPackets = _.compose(
    function(s) { $('#result').text(s) },
    processTriples);

// Naive implementation
function polyToString(obj) {
  if (obj instanceof String)
    return obj;
  else if (obj instanceof Array)
    return stringifyArray(obj);

  return obj.toString();
}

console.log(polyToString([1,2,3])); //=> "[1,2,3]"
console.log(polyToString([1,2,[3,4]])); //=> "[1,2,[3,4]]"

function stringifyArray(ary) {
  return ["[", _.map(ary, polyToString).join(","), "]"].join('');
}

// A better approach using dispatch
var polyToString = dispatch(
    function(s) { return _.isString(s) ? s : undefined },
    function(s) { return _.isArray(s) ? stringifyArray(s) : undefined },
//    function(s) { return _.isObject(s) ? JSON.stringify(s) : undefined },
    function(s) { return s.toString() });

console.log(polyToString(42)); //=> "42"
console.log(polyToString([1,2,[3,4]])); //=> "[1, 2, [3, 4]]"
console.log(polyToString('a')); //=> "a"

console.log(polyToString({a: 1, b: 2})); //=> "[object Object]"

// Extended with isObject
var polyToString = dispatch(
    function(s) { return _.isString(s) ? s : undefined },
    function(s) { return _.isArray(s) ? stringifyArray(s) : undefined },
    function(s) { return _.isObject(s) ? JSON.stringify(s) : undefined },
    function(s) { return s.toString() });

console.log(polyToString([1,2,{a: 42, b: [4,5,6]}, 77]));
//=> '[1,2,{"a":42,"b":[4,5,6]},77]'

// The use of dispatch in this way is quite elegant,2 but I can’t help but
// feel a little weird about it. Adding support for yet another type, perhaps
// Container from Chapter 7 can illustrate my discomfort

// But the problem is that dispatch works in a very straightforward way.
// That is, it starts from the first function and tries every one until one
// of them returns a value. Encoding type information beyond a single
// hierarchical level would eventually become more complicated than it needs
// to be.

Container.prototype.init = _.identity;

function Container(val) {
  this._value = val;
  this.init(val);
}

console.log(polyToString(new Container(_.range(5))));
//=> {"_value":[0,1,2,3,4]}"

console.log((new Container(42)).toString()); //=> "[object Object]"

Container.prototype.toString = function() {
  return ["@<", polyToString(this._value), ">"].join('');
}

console.log((new Container(42)).toString());
//=> "@<42>"
console.log((new Container({a: 42, b: [1,2,3]})).toString());
//=> "@<{"a":42,"b":[1,2,3]}>"

function ContainerClass() {}
function ObservedContainerClass() {}
function HoleClass() {}
function CASClass() {}
function TableBaseClass() {}

ObservedContainerClass.prototype = new ContainerClass();
HoleClass.prototype = new ObservedContainerClass();
CASClass.prototype = new HoleClass();
TableBaseClass.prototype = new HoleClass();

console.log((new CASClass()) instanceof HoleClass); //=> true
console.log((new TableBaseClass()) instanceof HoleClass); //=> true
console.log((new HoleClass()) instanceof CASClass); //=> false

//var ContainerClass = Class.extend({
//  init: function(val) {
//    this._value = val;
//  },
//});
//
//var c = new ContainerClass(42);
//
//c;
////=> {_value: 42 ...}
//
//c instanceof Class;
////=> true
//
//var ObservedContainerClass = ContainerClass.extend({
//  observe: function(f) { note("set observer") },
//  notify: function() { note("notifying observers") }
//});
//
//var HoleClass = ObservedContainerClass.extend({
//  init: function(val) { this.setValue(val) },
//  setValue: function(val) {
//    this._value = val;
//    this.notify();
//    return val;
//  }
//});
//
//var CASClass = HoleClass.extend({
//  swap: function(oldVal, newVal) {
//    if (!_.isEqual(oldVal, this._value)) fail("No match");
//
//    return this.setValue(newVal);
//  }
//});

// Flattening the Hierarchy with Mixins

function Container(val) {
  this._value = val;
  this.init(val);
}

Container.prototype.init = _.identity;

var c = new Container(42);
console.log(c);
//=> {_value: 42}

// The mixin protocol specification for HoleMixin is as follows:
//  Extension protocol: Must provide notify, validate and init methods
//  Interface protocol: Constructor and setValue
var HoleMixin = {
  setValue: function(newValue) {
    var oldVal  = this._value;

    this.validate(newValue);
    this._value = newValue;
    this.notify(oldVal, newValue);
    return this._value;
  }
};

var Hole = function(val) {
  // The use of the Container.call method taking the Hole instance’s this
  // pointer ensures that what‐ ever Container does on construction will
  // occur in the context of the Hole instance
  Container.call(this, val);
};

logError(function () { new Hole(42) } );
//TypeError: Object [object Object] has no method 'init'

var ObserverMixin = (function() {
  var _watchers = [];

  return {
    watch: function(fun) {
      _watchers.push(fun);
      return _.size(_watchers);
    },
    notify: function(oldVal, newVal) {
      _.each(_watchers, function(watcher) {
        watcher.call(this, oldVal, newVal);
      });

      return _.size(_watchers);
    }
  };
}());

var ValidateMixin = {
  addValidator: function(fun) {
    this._validator = fun;
  },
  init: function(val) {
    this.validate(val);
  },
  validate: function(val) {
    if (existy(this._validator) &&
        !this._validator(val))
      fail("Attempted to set invalid value " + polyToString(val));
  }
};

_.extend(Hole.prototype
    , HoleMixin
    , ValidateMixin
    , ObserverMixin);

// After mixins have been plugged in, it works
var h = new Hole(42);
console.log(h);

h.addValidator(always(false));

logError(function () { h.setValue(9) });
// Error: Attempted to set invalid value 9

var h = new Hole(42);
h.addValidator(isEven);

logError(function () { h.setValue(9) });
// Error: Attempted to set invalid value 9

console.log(h.setValue(108)); //=> 108

console.log(h);
//=> {_validator: function isEven(n) {...}, // _value: 108}


console.log(h.watch(function(old, nu) {
  note(["Changing", old, "to", nu].join(' '));
}));
//=> 1

console.log(h.setValue(42));
// NOTE: Changing 108 to 42
// => 42

console.log(h.watch(function(old, nu) {
  note(["Veranderende", old, "tot", nu].join(' '));
}));
//=> 2

console.log(h.setValue(36));
// NOTE: Changing 42 to 36
// NOTE: Veranderende 42 tot 36 //=> 36

// The mixin protocol specification for SwapMixin is as follows:
//  Extension protocol: Must provide a setValue method and a _value property
//  Interface protocol: The swap method
var SwapMixin = {
  swap: function(fun /* , args... */) {
    var args = _.rest(arguments)
    var newValue = fun.apply(this, construct(this._value, args));

    return this.setValue(newValue);
  }
};

// I can actually test the SwapMixin in isolation:
var o = {_value: 0, setValue: _.identity};
_.extend(o, SwapMixin);
console.log(o.swap(construct, [1,2,3])); //=> [0, 1, 2, 3]

// Offers a way to safely grab the value in the Hole instance:
var SnapshotMixin = {
  snapshot: function() {
    return deepClone(this._value);
  }
};

_.extend(Hole.prototype
    , HoleMixin
    , ValidateMixin
    , ObserverMixin
    , SwapMixin
    , SnapshotMixin);

var h = new Hole(42);
console.log(h.snapshot()); //=> 42
console.log(h.swap(always(99))); //=> 99
console.log(h.snapshot()); //=> 99

var CAS = function(val) {
  Hole.call(this, val);
};

var CASMixin = {
  swap: function(oldVal, f) {
    if (this._value === oldVal) {
      this.setValue(f(this._value));
      return this._value;
    }
    else {
      return undefined;
    }
  }
};

// I could simply leave out the SwapMixin on the extension and use the
// CASMixin instead, since I know that the swap method is the only replacement.
// However, I will instead use ordering to _.extend to take care of the override:
_.extend(CAS.prototype
    , HoleMixin
    , ValidateMixin
    , ObserverMixin
    , SwapMixin
    , CASMixin
    , SnapshotMixin);

var c = new CAS(42); c.swap(42, always(-1));
console.log(c); //=> -1
console.log(c.snapshot()); //=> -1
console.log(c.swap('not the value', always(100000))); //=> undefined
console.log(c.snapshot()); //=> -1

// That the types created in the previous sections are object/method-centric
// is a technical detail that need not leak into a functional API.
function contain(value) {
  return new Container(value);
}

// If I were providing a container library, then I would offer the contain
// function as the user-facing API:
console.log(contain(42));
//=> {_value: 42} (of type Container, but who cares?)

// For developers, I might additionally provide the mixin definitions for
// extension purposes:
function hole(val /*, validator */) {
  var h = new Hole();
  var v = _.toArray(arguments)[1];

  if (v) h.addValidator(v);

  h.setValue(val);

  return h;
}

// I’ve managed to encapsulate a lot of the logic of validation within the
// confines of the hole function. This is ideal because I can compose the
// underlying methods in any way that I want. The usage contract of the hole
// function is much simpler than the combined use of the Hole constructor and
// the addValidator method.

logError(function() { hole(42, always(false)) });
// Error: Attempted to set invalid value 42

// Although setValue is a method on the type, there is no reason to expose it
// functionally. Instead, I can expose just the swap and snapshot functions
// instead:
var swap = invoker('swap', Hole.prototype.swap);

var x = hole(42);
console.log(swap(x, sqr));
//=> 1764

// Exposing the functionality of the CAS type is very similar to Hole:
function cas(val /*, args */) {
  var h = hole.apply(this, arguments);
  var c = new CAS(val);
  c._validator = h._validator;

  return c;
}

// I’m using (abusing) private details of the Hole type to implement most of
// the capability of the cas function, but since I control the code to both
// types, I can justify the coupling. In general, I would avoid that,
// especially if the abused type is not under my immediate control.

var compareAndSwap = invoker('swap', CAS.prototype.swap);

function snapshot(o) { return o.snapshot() }
function addWatcher(o, fun) { o.watch(fun) }

var x = hole(42);
addWatcher(x, note);
console.log(swap(x, sqr));
// NOTE: 42
// => 1764
var y = cas(9, isOdd);
console.log(compareAndSwap(y, 9, always(1)));
//=> 1
console.log(snapshot(y)); //=> 1