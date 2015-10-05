var _ = require("./underscore");

function existy(x) { return x != null }

function truthy(x) { return (x !== false) && existy(x) }

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

function construct(head, tail) {
  return cat([head], _.toArray(tail));
}

function cat() {
  var head = _.first(arguments);
  if (existy(head))
    return head.concat.apply(head, _.rest(arguments));
  else
    return [];
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

var str = dispatch(invoker('toString', Array.prototype.toString),
                   invoker('toString', String.prototype.toString));

console.log(str("a"));
//=> "a"

console.log(str(_.range(10)));
//=> "0,1,2,3,4,5,6,7,8,9"

function stringReverse(s) {
  if (!_.isString(s)) return undefined;
  return s.split('').reverse().join("");
}

console.log(stringReverse("abc"));
//=> "cba"

console.log(stringReverse(1));
//=> undefined

// Compose reverse functions to calculate reverses independent of type
var rev = dispatch(invoker('reverse', Array.prototype.reverse),
                   stringReverse);

console.log(rev([1,2,3]));
//=> [3, 2, 1]

console.log(rev("abc"));
//=> "cba"

function always(VALUE) {
  return function() {
    return VALUE;
  };
}

// Use dispatch to return a terminating function providing default behaviour
// As a nice bonus, a function created by dispatch can also be an argument to
// dispatch for maximum flexibility:
var sillyReverse = dispatch(rev, always(42));

console.log(sillyReverse([1,2,3]));
//=> [3, 2, 1]

console.log(sillyReverse("abc"));
//=> "cba"

console.log(sillyReverse(100000));
//=> 42

// Hardcoded switch statement based manual dispatch, ugly!
function performCommandHardcoded(command) {
  var result;

  switch (command.type)
  {
    case 'notify':
      result = notify(command.message);
      break;
    case 'join':
      result = changeView(command.target);
      break;
    default:
      alert(command.type);
  }

  return result;
}

// console.log(performCommandHardcoded({type: 'notify', message: 'hi!'}));
// does the nofity action

// console.log(performCommandHardcoded({type: 'join', target: 'waiting-room'}));
// does the changeView action

// console.log(performCommandHardcoded({type: 'wat'}));
// pops up an alert box

// Eliminate switch pattern with dispatch:
function isa(type, action) {
  return function(obj) {
    if (type === obj.type)
      return action(obj);
  }
}

// Amazingly succinct!
// It’s the return of undefined that signals to dispatch to try the next dispatch sub-function.
var performCommand = dispatch(
    isa('notify', function(obj) { return notify(obj.message) }),
    isa('join',   function(obj) { return changeView(obj.target) }),
    function(obj) { alert(obj.type) });

// To extend the performCommandHardcoded function, you would need to go in
// and change the actual switch statement itself. However, you can extend
// the performCommand func‐ tion with new behavior by simply wrapping it in
// another dispatch function
var performAdminCommand = dispatch(
    isa('kill', function(obj) { return shutdown(obj.hostname) }),
    performCommand); // fallback on previous behaviour, great composition!

//performAdminCommand({type: 'kill', hostname: 'localhost'});
// does the shutdown action

//performAdminCommand({type: 'flail'});
// alert box pops up

//performAdminCommand({type: 'join', target: 'foo'});
// does the changeView action

// You can also restrict the behavior by overriding commands earlier in the dispatch chain!
var performTrialUserCommand = dispatch(
    isa('join', function(obj) { alert("Cannot join until approved") }),
    performCommand); // fallback on previous behaviour, great composition!

//performTrialUserCommand({type: 'join', target: 'foo'});
// alert box denial pops up

//performTrialUserCommand({type: 'notify', message: 'Hi new user'});
// does the notify action

function rightAwayInvoker() {
  var args = _.toArray(arguments);
  var method = args.shift();
  var target = args.shift();

  return method.apply(target, args);
}

console.log(rightAwayInvoker(Array.prototype.reverse, [1,2,3]));
//=> [3, 2, 1]

console.log(invoker('reverse', Array.prototype.reverse)([1,2,3]));
//=> [3, 2, 1]

function leftCurryDiv(n) {
  return function(d) {
    return n/d;
  };
}

var divide10By = leftCurryDiv(10); // 10 / ?
console.log(divide10By(2)); // 10 / 2
//=> 5

function rightCurryDiv(d) {
  return function(n) {
    return n/d;
  };
}

var divideBy10 = rightCurryDiv(10); // ? / 10
console.log(divideBy10(2));
//=> 0.2

function curry(fun) {
  return function(arg) {
    return fun(arg);
  };
}

console.log(parseInt('11'));
//=> 11

console.log(parseInt('11', 2));
//=> 3

// Complications when using parseInt due to optional parameters related to base
// The problem here is that in some versions of JavaScript, the function given
// to Array#map will be invoked with each element of the array, the index of
// the element, plus the array itself. So as you might have guessed, the
// radix argument for parseInt starts with 0 and then becomes 1, 2, and then 3!
console.log(['11','11','11','11'].map(parseInt));
// [ 11, NaN, 3, 4 ]

// Use curry to make sure each element is applied individually
console.log(['11','11','11','11'].map(curry(parseInt)));
//=> [11, 11, 11, 11]

function curry2(fun) {
  return function(secondArg) {
    return function(firstArg) {
      return fun(firstArg, secondArg);
    };
  };
}

function div(n, d) { return n / d }

var div10 = curry2(div)(10); // divideBy10, similar to right curry

console.log(div10(50));
//=> 5

// curry2 can be used to fix the behavior of parseInt so that it handles
// only binary numbers when parsing
var parseBinaryString = curry2(parseInt)(2);

console.log(parseBinaryString("111"));
//=> 7

console.log(parseBinaryString("10"));
//=> 2

var plays = [{artist: "Burial", track: "Archangel"},
  {artist: "Ben Frost", track: "Stomp"},
  {artist: "Ben Frost", track: "Stomp"},
  {artist: "Burial", track: "Archangel"},
  {artist: "Emeralds", track: "Snores"},
  {artist: "Burial", track: "Archangel"}];

console.log(_.countBy(plays, function(song) {
  return [song.artist, song.track].join(" - ");
}));
//=> {"Ben Frost - Stomp": 2,
//    "Burial - Archangel": 3,
//    "Emeralds - Snores": 1}

function songToString(song) {
  return [song.artist, song.track].join(" - ");
}

var songCount = curry2(_.countBy)(songToString);

// The use of currying in this way forms a virtual sentence,
// effectively stating “to implement songCount, countBy songToString.
console.log(songCount(plays));
//=> {"Ben Frost - Stomp": 2,
//    "Burial - Archangel": 3,
//    "Emeralds - Snores": 1}

function curry3(fun) {
  return function(last) {
    return function(middle) {
      return function(first) {
        return fun(first, middle, last);
      };
    };
  };
};

// uniq builds an array of all of the unique songs played
// curry3 translates to:
//           _.uniq(plays, false,   songToString);
//    curry3(_.uniq)       (false) (songToString)
// false is for isSorted parameter to uniq
var songsPlayed = curry3(_.uniq)(false)(songToString);

console.log(songsPlayed(plays));
//=> [{artist: "Burial", track: "Archangel"},
//    {artist: "Ben Frost", track: "Stomp"},
//    {artist: "Emeralds", track: "Snores"}]

// Use curry3 as a way to generate HTML hexadecimal values with specific hues:
function toHex(n) {
  var hex = n.toString(16);
  return (hex.length < 2) ? [0, hex].join(''): hex;
}

function rgbToHexString(r, g, b) {
  return ["#", toHex(r), toHex(g), toHex(b)].join('');
}

// Use directly
console.log(rgbToHexString(255, 255, 255));
//=> "#ffffff"

// Used with currying to variying depths to achieve more specific colors or hues
var blueGreenish = curry3(rgbToHexString)(255)(200);

console.log(blueGreenish(0));
//=> "#00c8ff"

// Does the API utilize higher-order functions? If the answer is yes,
// then curried functions, at least to one parameter, are appropriate.

var greaterThan = curry2(function (lhs, rhs) { return lhs > rhs });
var lessThan    = curry2(function (lhs, rhs) { return lhs < rhs });

function checker(/* validators */) {
  var validators = _.toArray(arguments);

  return function(obj) {
    return _.reduce(validators, function(errs, check) {
      if (check(obj))
        return errs;
      else
      // Using chain hides mutation of array
        return _.chain(errs).push(check.message).value();
    }, []);
  };
}

function validator(message, fun) {
  var f = function(/* args */) {
    return fun.apply(fun, arguments);
  };

  f['message'] = message;
  return f;
}

// This use of curried functions is much easier on the eyes than directly
// using the anonymous versions of the greater-than and less-than calculations.
var withinRange = checker(
    validator("arg must be greater than 10", greaterThan(10)),
    validator("arg must be less than 20", lessThan(20)));

console.log(withinRange(15));
//=> []

console.log(withinRange(1));
//=> ["arg must be greater than 10"]

console.log(withinRange(100));
//=> ["arg must be less than 20"]

// While it’s nice to provide both curry2 and curry3, perhaps it would be
// better to provide a function named curryAll that curries at an arbitrary
// depth.

function divPart(n) {
  return function(d) {
    return n / d;
  };
}

// This is exactly same as leftCurryDiv, and that highlights the relationship
// between currying and partial application
var over10Part = divPart(10);
console.log(over10Part(2));
//=> 5

// The relationship between currying and partial application; the curried
// function needs three cascading calls (e.g. curried(3)(2)(1)) before FUN
// runs, whereas the partially applied function is ready to rock, needing
// only one call of two args (e.g., partially(2, 3))

function partial1(fun, arg1) {
  return function(/* args */) {
    var args = construct(arg1, arguments);
    return fun.apply(fun, args);
  };
}

var over10Part1 = partial1(div, 10);

// Re-created the operation of the divide10By function by composing a
// function from another function and a “configuration” argument.
console.log(over10Part1(5));
//=> 2

function partial2(fun, arg1, arg2) {
  return function(/* args */) {
    var args = cat([arg1, arg2], arguments);
    return fun.apply(fun, args);
  };
}

var div10By2 = partial2(div, 10, 2);

console.log(div10By2());
//=> 5

function partial(fun /*, pargs */) {
  var pargs = _.rest(arguments);

  return function(/* arguments */) {
    var args = cat(pargs, _.toArray(arguments));
    return fun.apply(fun, args);
  };
}

var over10Partial = partial(div, 10);
console.log(over10Partial(2));
//=> 5

// Partial functions, along with varargs can create confusion when the
// function expects a fixed number of parameters
// In this case, the partially applied div function is just called one time
// with the arguments 10 and 2, and the remaining arguments are simply ignored
// This is not normally a problem though!
var div10By2By4By5000Partial = partial(div, 10, 2, 4, 5000);
console.log(div10By2By4By5000Partial());
//=> 5

var zero = validator("cannot be zero", function(n) { return 0 === n });
var number = validator("arg must be a number", _.isNumber);

function sqr(n) {
  if (!number(n)) throw new Error(number.message);
  if (zero(n))    throw new Error(zero.message);

  return n * n;
}

function logError(f) {
  try {
    f.apply()
  } catch (e) {
    console.log(e);
  }
}

console.log(sqr(10));
//=> 100
logError(function() { sqr(0) });
// Error: cannot be zero
logError(function() { sqr('') });
// Error: arg must be a number

// Mapcat is applicative since it takes a function
function mapcat(fun, coll) {
  return cat.apply(null, _.map(coll, fun));
}

// Function returned from condition1 is meant to take only a single argument.
// This is done primarily for illustrative purposes, as the vararg version is
// a bit more complicated.
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

var sqrPre = condition1(
    validator("arg must not be zero", complement(zero)),
    validator("arg must be a number", _.isNumber));

function complement(pred) {
  return function() {
    return !pred.apply(null, _.toArray(arguments));
  };
}

var sqrPre = condition1(
    validator("arg must not be zero", complement(zero)),
    validator("arg must be a number", _.isNumber));

console.log(sqrPre(_.identity, 10));
//=> 10

logError(function() { sqrPre(_.identity, '') });
// Error: arg must be a number

logError(function() { sqrPre(_.identity, 0) });
// Error: arg must not be zero

// Unsafe version of square function
function uncheckedSqr(n) { return n * n };

console.log(uncheckedSqr(''));
//=> 0

// Compose prerequisite checks with running unchecked square function, very neat!
// By separating these two, precondition checks could be disabled or swapped easily!
// Could have used partial instead of partial1 in this example,
// but sometimes I like more explicitness in my code.
var checkedSqr = partial1(sqrPre, uncheckedSqr);

console.log(checkedSqr(10));
//=> 100

logError(function () { checkedSqr('') });
// Error: arg must be a number

logError(function () { checkedSqr(0) });
// Error: arg must not be zero

function isEven(n) { return (n%2) === 0 }

var sillySquare = partial1(
    condition1(validator("should be even", isEven)),
    checkedSqr);

console.log(sillySquare(10));
//=> 100

logError(function () { sillySquare(11) });
// Error: should be even

logError(function () { sillySquare('') });
// Error: arg must be a number

logError(function () { sillySquare(0) });
// Error: arg must not be zero

// Validator to check that the command object has values associated with certain keys
function hasKeys() {
  var KEYS = _.toArray(arguments);

  var fun = function(obj) {
    return _.every(KEYS, function(k) {
      return _.has(obj, k);
    });
  };

  fun.message = cat(["Must have values for keys:"], KEYS).join(" ");
  return fun;
}

var validateCommand = condition1(
    validator("arg must be a map", _.isObject),
    validator("arg must have the correct keys", hasKeys('msg',
                                                        'type')));

// Why use the _.identity function as the logic part of the createCommand function?
// Need identity to be able to return an instance...? <- my guess
var createCommand = partial(validateCommand, _.identity);

logError(function () { createCommand({}) });
// Error: arg must have right keys

logError(function () { createCommand(21) });
// Error: arg must be a map, arg must have right keys

console.log(createCommand({msg: "", type: ""}));
//=> {msg: "", type: ""}

var createLaunchCommand = partial1(
    condition1(
        validator("arg must have the count down", hasKeys('countDown'))),
    createCommand);

logError(function () { createLaunchCommand({msg: "", type: ""}) });
// Error: arg must have the count down

console.log(createLaunchCommand({msg: "", type: "", countDown: 10}));
//=> {msg: "", type: "", countDown: 10}

// Compose works from right to left, just like Haskell's (.)
var isntString = _.compose(function(x) { return !x }, _.isString);

console.log(isntString([]));
//=> true

console.log(isntString(1));
//=> true

console.log(isntString("1"));
//=> false

function not(x) { return !x }

var isntString = _.compose(not, _.isString);

function splat(fun) {
  return function (array) {
    return fun.apply(null, array);
  };
}

var composedMapcat = _.compose(splat(cat), _.map);

console.log(composedMapcat([[1,2],[3,4],[5]], _.identity));
//=> [1, 2, 3, 4, 5]

// Another option is to rewrite condition1 to work with an intermediate
// object type named Either that holds either the resulting value or an
// error string.
var sqrPost = condition1(
    validator("result should be a number", _.isNumber),
    validator("result should not be zero", complement(zero)),
    validator("result should be positive", greaterThan(0)));

logError(function () { sqrPost(_.identity, 0) });
// Error: result should not be zero, result should be positive

logError(function () { sqrPost(_.identity, -1) });
// Error: result should be positive

logError(function () { sqrPost(_.identity, '') });
// Error: result should be a number, result should be positive

console.log(sqrPost(_.identity, 100));
//=> 100

// Compose sqr: check pre, unsafe sqr, check post
var megaCheckedSqr = _.compose(partial(sqrPost, _.identity), checkedSqr);

console.log(megaCheckedSqr(10));
//=> 100

// Fails in pre-condition
logError(function () { megaCheckedSqr(0) });
// Error: arg must not be zero

// Fails in post-condition
logError(function () { megaCheckedSqr(NaN); });
// Error: result should be positive