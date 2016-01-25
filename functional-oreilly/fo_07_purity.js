// To run from command line, uncomment this line
// To run spec from web, comment this line
var _ = require("./underscore");

function logError(f) {
  try {
    f.apply()
  } catch (e) {
    console.log(e);
  }
}

function repeatedly(times, fun) {
  return _.map(_.range(times), fun);
}

function always(VALUE) {
  return function() {
    return VALUE;
  };
}

function doWhen(cond, action) {
  if(truthy(cond))
    return action();
  else
    return undefined;
}

function existy(x) { return x != null }

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

function truthy(x) { return (x !== false) && existy(x) }

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

function complement(pred) {
  return function() {
    return !pred.apply(null, _.toArray(arguments));
  };
}

function curry2(fun) {
  return function(secondArg) {
    return function(firstArg) {
      return fun(firstArg, secondArg);
    };
  };
}

function cat() {
  var head = _.first(arguments);
  if (existy(head))
    return head.concat.apply(head, _.rest(arguments));
  else
    return [];
}

function partial(fun /*, pargs */) {
  var pargs = _.rest(arguments);

  return function(/* arguments */) {
    var args = cat(pargs, _.toArray(arguments));
    return fun.apply(fun, args);
  };
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

var greaterThan = curry2(function (lhs, rhs) { return lhs > rhs });

function validator(message, fun) {
  var f = function(/* args */) {
    return fun.apply(fun, arguments);
  };

  f['message'] = message;
  return f;
}

var zero = validator("cannot be zero", function(n) { return 0 === n });
var number = validator("arg must be a number", _.isNumber);

var sqrPost = condition1(
    validator("result should be a number", _.isNumber),
    validator("result should not be zero", complement(zero)),
    validator("result should be positive", greaterThan(0)));

var sqrPre = condition1(
    validator("arg must not be zero", complement(zero)),
    validator("arg must be a number", _.isNumber));

function uncheckedSqr(n) { return n * n }

var checkedSqr = partial1(sqrPre, uncheckedSqr);

var megaCheckedSqr = _.compose(partial(sqrPost, _.identity), checkedSqr);

console.log(megaCheckedSqr(10));
//=> 100

///////////////////////////////////////////////////////////////////////////////

// We want a function that returns a random number of 1 and up, but
// .random() returns 0 too. So, create a partial function where the minimum is 1.
var rand = partial1(_.random, 1);

// Generate a number from 1 to 10
console.log(rand(10));

// Generate 10 numbers from 1 to 10, both inclusive
console.log(repeatedly(10, partial1(rand, 10)));

// Take the first 5 values
console.log(_.take(repeatedly(100, partial1(rand, 10)), 5));
//=> [9, 6, 6, 4, 6]

function randString(len) {
  var ascii = repeatedly(len,  partial1(rand, 26));

  return _.map(ascii, function(n) {
    return n.toString(36);
  }).join('');
}

console.log(randString(0));
//=> ""

console.log(randString(1));
//=> random string of 1 char

console.log(randString(10));
//=> random string of 10 chars

function sqr(n) {
  if (!number(n)) throw new Error(number.message);
  if (zero(n))    throw new Error(zero.message);

  return n * n;
}

PI = 3.14;

function areaOfACircle(radius) {
  return PI * sqr(radius);
}

console.log(areaOfACircle(3));
//=> 28.26

// Separate the pure from the impure:
// generateRandomCharacter is impure...
function generateRandomCharacter() {
  ranNum = rand(26);
  console.log(ranNum);
  return ranNum.toString(36);
}

// generateString is pure...
function generateString(charGen, len) {
  return repeatedly(len, charGen).join('');
}

console.log(generateString(generateRandomCharacter, 20));
//=> random String of 20 characters

// generateString is a high-order function, so we can use partial to compose
// the original impure version of randomString:
var composedRandomString = partial1(generateString, generateRandomCharacter);

console.log(composedRandomString(10));
//=> random String of 10 characters

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

// nth is a pure function
console.log(nth(['a', 'b', 'c'], 1));
//=> 'b'
console.log(nth(['a', 'b', 'c'], 1));
//=> 'b'

// nth will never modify the array given to it:
var a = ['a', 'b', 'c'];
console.log(nth(a, 1));
//=> 'b'
console.log(a===a);
//=> true
console.log(nth(a, 1));
//=> 'b'
console.log(_.isEqual(a, ['a', 'b', 'c']));
//=> true

// The one limiting factor, and it’s one that we’ve got to live with in
// JavaScript, is that the nth function might return something that’s impure,
// such as an object, an array, or even an impure function
console.log(nth([{a: 1}, {b: 2}], 0));
//=> {a: 1}
console.log(nth([function() { console.log('blah') }], 0));
//=> function ...

// Idempotence is the idea that executing an activity numerous times has the
// same effect as executing it once:
//    someFun(arg) == _.compose(someFun, someFun)(arg);

var a = [1, [10, 20, 30], 3];

var secondTwice = _.compose(second, second);

// Not idempotent since running second twice returns something different,
// due to having a second array in the second position of the original array.
console.log(second(a) === secondTwice(a));
//=> false

// The most straightforward idempotent function is probably Underscore’s _.identity function:
var dissociativeIdentity = _.compose(_.identity, _.identity);
console.log(_.identity(42) === dissociativeIdentity(42));
//=> true

//JavaScript’s Math.abs method is also idempotent:
console.log(42 == Math.abs(Math.abs(-42)));
//=> 42

// Very few data types in JavaScript are immutable by default.
// Strings are one example of a data type that cannot be changed:
var s = "Lemongrab";
console.log(s.toUpperCase());
//=> "LEMONGRAB"

console.log(s);
//=> "Lemongrab"

// Given a number n and an array, returns an array containing every nth element
// Within the implementation of skipTake, I very deliberately used an array
// coupled with an imperative loop performing an Array#push. There are ways
// to implement skip Take using functional techniques, therefore requiring no
// explicit mutation. However, the for loop implementation is small,
// straightforward, and fast. More importantly, the use of this imperative
// approach is completely hidden from the users of the skipTake function.
function skipTake(n, coll) {
  var ret = [];
  var sz = _.size(coll);

  for(var index = 0; index < sz; index += n) {
    ret.push(coll[index]);
  }

  return ret;
}

// Take every 2nd
console.log(skipTake(2, [1,2,3,4,5,6]));
//=> [1, 3, 5]

// Take every 3rd
console.log(skipTake(3, [1,2,3,4,5,6,7]));
//=> [1, 4, 7]

console.log(skipTake(3, _.range(20)));
//=> [0, 3, 6, 9, 12, 15, 18]

// Immutability and the Relationship to Recursion
// In many functional programming languages, you cannot write a function like
// summ using local mutation. In Javascript you can, so one option to
// implement summ would be to do it in an imperative way:
function summ(ary) {
  var result = 0;
  var sz = ary.length;

  for (var i = 0; i < sz; i++)
    result += ary[i];

  return result;
}

console.log(summ(_.range(1,11)));
//=> 55

// In purely functional programming languages, recursion is the only way to
// do this since there are no variables and everything is immutable:
function summRec(ary, seed) {
  if (_.isEmpty(ary))
    return seed;
  else
    return summRec(_.rest(ary), _.first(ary) + seed);
}

console.log(summRec([], 0));
//=> 0

console.log(summRec(_.range(1,11), 0));
//=> 55

var a=[1,2,3];
a[1] = 42;

console.log(a);
//=> [1, 42, 3]

Object.freeze(a);

a[1] = 108;

// Mutations will no longer take effect
console.log(a);
//=> [1, 42, 3]

// Check if an object is frozen
console.log(Object.isFrozen(a));
//=> true

var x = [{a: [1, 2, 3], b: 42}, {c: {d: []}}];

Object.freeze(x);

// Attempting to mutate the array a fails to make a modification
x[0] = "";

console.log(x);
//=> [{a: [1, 2, 3], b: 42}, {c: {d: []}}];

// Mutating within a’s nested structures indeed makes a change!
x[1]['c']['d'] = 100000;

console.log(x);
//=> [{a: [1, 2, 3], b: 42}, {c: {d: 100000}}];

function deepFreeze(obj) {
  if (!Object.isFrozen(obj))
    Object.freeze(obj);

  for (var key in obj) {
    if (!obj.hasOwnProperty(key) || !_.isObject(obj[key]))
      continue;

    deepFreeze(obj[key]);
  }
}

var x = [{a: [1, 2, 3], b: 42}, {c: {d: []}}];
deepFreeze(x);

x[0] = null;
console.log(x);
//=> [{a: [1, 2, 3], b: 42}, {c: {d: []}}];

x[1]['c']['d'] = 42;

console.log(x);
//=> [{a: [1, 2, 3], b: 42}, {c: {d: []}}];

var freq = curry2(_.countBy)(_.identity);

var a = repeatedly(1000, partial1(rand, 2));

var copy = _.clone(a);

console.log(freq(a));
//=> {1: 498, 2: 502}

console.log(_.isEqual(a, copy));
//=>true

// skipTake is pure, even though it used mutable structures inside
console.log(freq(skipTake(2, a)));
//=> {1: 236, 2: 264}

console.log(_.isEqual(a, copy));
//=> true

var person = {fname: "Simon"};

// _.extend is impure, changes object passed in
console.log(_.extend(person, {lname: "Petrikov"}, {age: 28}, {age: 108}));
//=> {age: 108, fname: "Simon", lname: "Petrikov"}

console.log(person);
//=> {age: 108, fname: "Simon", lname: "Petrikov"})

// merge converts _.extend into a pure function!
// Instead of using the first argument as the target object, I instead stick a
// local empty object into the front of _.extend’s arguments and mutate that instead
function merge(/*args*/) {
  return _.extend.apply(null, construct({}, arguments));
}

var person = {fname: "Simon"};

console.log(merge(person, {lname: "Petrikov"}, {age: 28}, {age: 108}));
//console.log(merge(person, {lname: "Petrikov"}, {age: undefined}));
//=> {age: 108, fname: "Simon", lname: "Petrikov"}

console.log(person);
//=> {fname: "Simon"};

function Point(x, y) {
  this._x = x;
  this._y = y;
}

Point.prototype = {
  withX: function(val) {
    return new Point(val, this._y);
  },
  withY: function(val) {
    return new Point(this._x, val);
  }
};

var p = new Point(0, 1);

console.log(p.withX(1000));
//=> {_x: 1000, _y: 1}

console.log(p);
//=> {_x: 0, _y: 1}

console.log((new Point(0, 1))
    .withX(100)
    .withY(-100));
//=> {_x: 100, _y: -100}

function Queue(elems) {
  this._q = elems;
}

Queue.prototype = {
  enqueue: function(thing) {
    return new Queue(cat(this._q, [thing]));
  }
};

var seed = [1, 2, 3];

var q = new Queue(seed);
console.log(q);
//=> {_q: [1, 2, 3]}

var q2 = q.enqueue(108);
console.log(q2);
//=> {_q: [1, 2, 3, 108]}

console.log(q);
//=> {_q: [1, 2, 3]}

seed.push(10000);
console.log(q);
//=> {_q: [1, 2, 3, 10000]}

var SaferQueue = function(elems) {
  // A deepClone is probably not necessary because the purpose of the Queue
  // instance is to provide a policy for element adding and removal rather
  // than a data structure
  this._q = _.clone(elems);
};

SaferQueue.prototype = {
  enqueue: function(thing) {
    // Using the immutability-safe cat function will eliminate a problem of
    // sharing references between one SaferQueue instance and another
    return new SaferQueue(cat(this._q, [thing]));
  }
};

var seed = [1,2,3];
var q = new SaferQueue(seed);
var q2 = q.enqueue(36);
console.log(q2);
//=> {_q: [1, 2, 3, 36]}

seed.push(1000);
console.log(q);
//=> {_q: [1, 2, 3]}

// Not everything is safe. the q instance has a public field _q that I could
// easily modify directly:
q._q.push(-1111);
console.log(q);
//=> {_q: [1, 2, 3, -1111]}

// Likewise, I could easily replace the methods on SaferQueue.prototype
// to do whatever I want:
//SaferQueue.prototype.enqueue = sqr;
//console.log(q2.enqueue(42));
//=> 1764

var q = SaferQueue([1,2,3]);

// Whoops. I forgot the new!!
//console.log(q.enqueue(32));
// TypeError: Cannot call method 'enqueue' of undefined

// Instead, prefer constructor functions! Like a factory?
function queue() {
  return new SaferQueue(_.toArray(arguments));
}

var q = queue(1,2,3);
console.log(q);
console.log(q.enqueue(32));

// Use the invoker function to create a function to delegate to enqueue
var enqueue = invoker('enqueue', SaferQueue.prototype.enqueue);
console.log(enqueue(q, 42));
//=> {_q: [1, 2, 3, 42]}

// Policies for Controlling Change

// Rather than taking a random object and changing it in-place, a better
// strategy might be to hold the object in a container and change that instead:
//var container = contain({name: "Lemonjon"});
//container.set({name: "Lemongrab"});

// vs
var being = {name: "Lemonjon"};
being.name = "Lemongrab";

// Take this line of thinking one step further and restrict change to occur
// as the result of a function call:
//var container = contain({name: "Lemonjon"});
//container.update(merge, {name: "Lemongrab"});

// The idea behind this thinking is two-fold. First, rather than replacing
// the value directly, as with the fictional container#set method, change now
// occurs as the result of a function call given the current value of the
// container and some number of arguments.

function Container(init) {
  this._value = init;
}

var aNumber = new Container(42);
console.log(aNumber);
//=> {_value: 42}

Container.prototype = {
  // The thinking behind the Container#update method is simple: take a
  // function and some arguments and set the new value based on a call with
  // the existing (i.e., “old”) value
  update: function(fun /*, args */) {
    var args = _.rest(arguments);
    var oldValue = this._value;

    this._value = fun.apply(this, construct(oldValue, args));

    return this._value;
  }
};

var aNumber = new Container(42);

console.log(aNumber.update(function(n) { return n + 1 }));
//=> 43

console.log(aNumber);
//=> {_value: 43}

console.log(aNumber.update(function(n, x, y, z) { return n / x / y / z }, 1, 2, 3));
//=> 7.166666666666667

logError(function() { aNumber.update(_.compose(megaCheckedSqr, always(0))) });
// Error: arg must not be zero