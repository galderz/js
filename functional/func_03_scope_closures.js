var _ = require("./underscore");

aGlobalVariable = 'livin la vida global';
console.log(aGlobalVariable);
//=> livin la vida global

console.log(_.map(_.range(2), function() { return aGlobalVariable }));
//=> ["livin la vida global", "livin la vida global"]

// Variables are mutable
aGlobalVariable = 'i drink your milkshake';
console.log(aGlobalVariable);
//=> "i drink your milkshake

function makeEmptyObject() {
  return new Object();
}

aVariable = "Outer";

// The innermost variable value, In, takes precedence when used within the
// function passed to _.map. Lexical scope dictates that since the assignment
// aVariable to In occurs textually close to its innermost use, then that is
// its value at the time of use.
function afun() {
  var aVariable = "Middle";

  return _.map([1,2,3], function(e) {
    var aVariable = "In";

    return [aVariable, e].join(' ');
  });
}

console.log(afun());
//=> ["In 1", "In 2", "In 3"]

// Mimicking dynamic scope
// Maintaining a global map of stacks associated with binding names is the core of dynamic scoping
var globals = {};

function makeBindFun(resolver) {
  return function(k, v) {
    var stack = globals[k] || [];
    globals[k] = resolver(stack, v);
    return globals;
  };
}

var stackBinder = makeBindFun(function(stack, v) {
  stack.push(v);
  return stack;
});

var stackUnbinder = makeBindFun(function(stack) {
  stack.pop();
  return stack;
});

var dynamicLookup = function(k) {
  var slot = globals[k] || [];
  return _.last(slot);
};

stackBinder('a', 1);
stackBinder('b', 100);

console.log(dynamicLookup('a'));
//=> 1
console.log(dynamicLookup('b'));
//=> 100

console.log(globals);
//=> {'a': [1], 'b': [100]}

stackBinder('a', '*');

// Lookup returns the last value bound.
// To retrieve previous value, you need to unbind.
console.log(dynamicLookup('a'));
//=> '*'

console.log(globals);
//=> {'a': [1, '*'], 'b': [100]}

stackUnbinder('a');

console.log(dynamicLookup('a'));
//=> 1”

function f() { return dynamicLookup('a'); };
function g() { stackBinder('a', 'g'); return f(); };

console.log(f());
//=> 1

console.log(g());
//=> 'g'

console.log(globals);
// {a: [1, "g"], b: [100]}

// The value of the this reference, like our binding of a, is also determined by the caller
function globalThis() { return this; }

console.log(globalThis());
//=> some global object, probably Window

console.log(globalThis.call('barnabas'));
//=> 'barnabas'

console.log(globalThis.apply('orsulak', []));
//=> 'orsulak”

// Thankfully, this problem does not arise if a this reference is never
// passed to call or apply, or if it is bound to null

// Underscore provides the function _.bind that allows you to lock the
// this reference from changing

var nopeThis   = _.bind(globalThis, 'nope');

console.log(nopeThis.call('wat'));
//=> 'nope';

var target = {name: 'the right value',
  aux: function() { return this.name; },
  act: function() { return this.aux(); }};

// target.act.call('wat');
// TypeError: Object [object String] has no method 'aux”

// “_.bindAll function is used to lock the this reference
// to a stable value for all of the named methods
_.bindAll(target, 'aux', 'act');

console.log(target.act.call('wat'));
//=> 'the right value

// Function Scope
// Instead of accessing bindings in a global hash map, the new model will
// instead require that all bindings be constrained to the smallest area
// possible (namely, the function). This follows the scoping model adhered
// to by JavaScript

function strangeIdentity(n) {
  // intentionally strange
  for(var i=0; i<n; i++);
  // In a language like Java, an attempt to access a variable like i,
  // defined locally to a for block, would provoke an access error
  // However, in JavaScript, all var declarations in a function body are
  // implicitly moved to the top of the function in which they occur
  return i;
}

console.log(strangeIdentity(138));
//=> 138

function strangeIdentity(n) {
  // Hoisted variable, this is what Javascript does with the above 'strangeIdentity' implementation
  var i;
  for(i=0; i<n; i++);
  return i;
}

function strangerIdentity(n) {
  // intentionally stranger still
  for(this['i'] = 0; this['i']<n; this['i']++);
  return this['i'];
}

console.log(strangerIdentity(108));
//=> 108

console.log(i);
//=> 108

// Supply a scratch space for the function to operate on
console.log(strangerIdentity.call({}, 10000));
//=> 10000

console.log(i);
//=> 108

function f () {
  this['a'] = 200;
  return this['a'] + this['b'];
}

var globals = {'b': 2};

// Pass in a global context via a clone
console.log(f.call(_.clone(globals)));
//=> 202

// Any effects are limited to the clone, and the global context is clean
console.log(globals);
//=> {'b': 2}

// **** All variables captured by a closure are capitalized from now on! ***
// This is only done for teaching purpouses and it's not standard practice

function whatWasTheLocal() {
  var CAPTURED = "Oh hai";

  return function() {
    return "The local was: " + CAPTURED;
  };
}

console.log(whatWasTheLocal().apply());
//=> The local was: Oh hai

var reportLocal = whatWasTheLocal();
console.log(reportLocal());
//=> The local was: Oh hai

function createScaleFunction(FACTOR) {
  return function(v) {
    return _.map(v, function(n) {
      return (n * FACTOR);
    });
  };
}

var scale10 = createScaleFunction(10);

console.log(scale10([1,2,3]));
//=> [10, 20, 30]

function createWeirdScaleFunction(FACTOR) {
  return function(v) {
    this['FACTOR'] = FACTOR;
    var captures = this;

    return _.map(v, _.bind(function(n) {
      return (n * this['FACTOR']);
    }, captures));
  };
}

var scale10 = createWeirdScaleFunction(10);

console.log(scale10.call({}, [5,6,7]));
//=> [50, 60, 70];

function makeAdder(CAPTURED) {
  return function(free) {
    return free + CAPTURED;
  };
}

var add10 = makeAdder(10);

console.log(add10(32));
//=> 42

var add1024 = makeAdder(1024);
console.log(add1024(11));
//=> 1035

// Each new adder function retains its own unique instance of CAPTURED,
// the one captured when each was created
console.log(add10(98));
//=> 108

function average(array) {
  var sum = _.reduce(array, function(a, b) { return a+b });
  return sum / _.size(array);
}

function averageDamp(FUN) {
  return function(n) {
    return average([n, FUN(n)]);
  }
}

var averageSq = averageDamp(function(n) { return n * n });
console.log(averageSq(10));
//=> 55

var name = "Fogus";
var name = "Renamed";

// Shadowing of variables
console.log(name);
//=> "Renamed”

// Shadowing via function parameters
var shadowed = 0;

function argShadow(shadowed) {
  return ["Value is", shadowed].join(' ');
}

console.log(argShadow(108));
//=> "Value is 108"

// Even when no arguments are passed, the binding for shadowed is still set.
console.log(argShadow());
//=> "Value is ”

var shadowed = 0;

function varShadow(shadowed) {
  var shadowed = 4320000;
  return ["Value is", shadowed].join(' ');
}

// The “closest” variable binding takes precedence
console.log(varShadow(4320000));
//=> "Value is 4320000"

// Shadowed variables are also carried along with closure
function captureShadow(SHADOWED) {
  return function(SHADOWED) {
    return SHADOWED + 1;
  };
}

var closureShadow = captureShadow(108);

console.log(closureShadow(2));
//=> 3 (it would stink if I were expecting 109 here)

// Moral of the story: avoid shadowing of variables

function complement(PRED) {
  return function() {
    return !PRED.apply(null, _.toArray(arguments));
  };
}

function isEven(n) { return (n%2) === 0 }

var isOdd = complement(isEven);

console.log(isOdd(2));
//=> false

console.log(isOdd(413));
//=> true

// Capturing captured variables as private, avoids reference changes crossing
// borders as a result of captured variables
var pingpong = (function() {
  // The captured variable PRIVATE is private to the two closures and
  // cannot be accessed through any means but by calling one of the two
  // functions
  var PRIVATE = 0;

  return {
    inc: function(n) {
      return PRIVATE += n;
    },
    dec: function(n) {
      return PRIVATE -= n;
    }
  };
})();

console.log(pingpong.inc(10));
//=> 10

console.log(pingpong.dec(7));
//=> 3

// Adding another function is safe:
pingpong.div = function(n) { return PRIVATE / n };

//pingpong.div(3);
// ReferenceError: PRIVATE is not defined

// Takes a key into an associative structure—such as an array or an object—and
// returns a function that, given a structure, returns the value at the key
function plucker(FIELD) {
  return function(obj) {
    return (obj && obj[FIELD]);
  };
}

var best = {title: "Infinite Jest", author: "DFW"};

var getTitle = plucker('title');

console.log(getTitle(best));
//=> "Infinite Jest"

var books = [{title: "Chthon"}, {stars: 5}, {title: "Botchan"}];

var third = plucker(2);

console.log(third(books));
//=> {title: "Botchan"}

console.log(_.filter(books, getTitle));
//=> [{title: "Chthon"}, {title: "Botchan"}]
