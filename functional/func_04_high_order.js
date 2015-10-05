var _ = require("./underscore");

console.log(_.max([1, 2, 3, 4, 5]));
//=> 5

console.log(_.max([1, 2, 3, 4.75, 4.5]));
//=> 4.75

var people = [{name: "Fred", age: 65}, {name: "Lucy", age: 36}];

console.log(_.max(people, function(p) { return p.age }));

//=> {name: "Fred", age: 65}

function finder(valueFun, bestFun, coll) {
  return _.reduce(coll, function(best, current) {
    var bestValue = valueFun(best);
    var currentValue = valueFun(current);

    return (bestValue === bestFun(bestValue, currentValue)) ? best : current;
  });
}

console.log(finder(_.identity, Math.max, [1,2,3,4,5]));
//=> 5

function plucker(FIELD) {
  return function(obj) {
    return (obj && obj[FIELD]);
  };
}

console.log(finder(plucker('age'), Math.max, people));
//=> {name: "Fred", age: 65}

console.log(finder(plucker('name'),
        function(x,y) { return (x.charAt(0) === "L") ? x : y },
        people));
//=> {name: "Lucy", age: 36}

// Cleaner version of finder
function best(fun, coll) {
  return _.reduce(coll, function(x, y) {
    return fun(x, y) ? x : y;
  });
}

console.log(best(function(x,y) { return x > y }, [1,2,3,4,5]));
//=> 5

// Repeat is not very generic, while a function that repeats a value some
// number of times is good, a function that repeats a computation some number
// of times is better
function repeat(times, VALUE) {
  return _.map(_.range(times), function() { return VALUE; });
}

console.log(repeat(4, "Major"));
//=> ["Major", "Major", "Major", "Major"]

// Repeat a computation a number of times
function repeatedly(times, fun) {
  return _.map(_.range(times), fun);
}

console.log(repeatedly(3, function() {
  return Math.floor((Math.random()*10)+1);
}));
//=> Randomised array of 3

console.log(repeatedly(3, function() { return "Odelay!"; }));
//=> ["Odelay!", "Odelay!", "Odelay!"]

// Web example of repeatedly using jQuery to generate a number of DOM nodes
//repeatedly(3, function(n) {
//  var id = 'id' + n;
//  $('body').append($("<p>Odelay!</p>").attr('id', id));
//  return id;
//});
//
// Page now has three Odelays
//=> ["id0", "id1", "id2"]

function iterateUntil(fun, check, init) {
  var ret = [];
  var result = fun(init);

  while (check(result)) {
    ret.push(result);
    result = fun(result);
  }

  return ret;
}

console.log(iterateUntil(
    function(n) { return n+n },
    function(n) { return n <= 1024 },
    1));
//=> [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]

// Doing the same with repeatedly requires you to know the number of times to call
console.log(repeatedly(10, function(exp) { return Math.pow(2,exp+1) }));
//=> [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]

function always(VALUE) {
  return function() {
    return VALUE;
  };
};

var f = always(function(){});

// A closure will capture a single value (or reference) and repeatedly return the same value
console.log(f() === f());
//=> true

var g = always(function(){});

console.log(f() === g());
//=> false”

console.log(repeatedly(3, always("Odelay!")));
//=> ["Odelay!", "Odelay!", "Odelay!"]

function existy(x) { return x != null };

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
};

var rev = invoker('reverse', Array.prototype.reverse);

console.log(_.map([[1,2,3]], rev));
//=> [[3,2,1]]

// Naive implementation for generating random strings
function naiveUniqueString(len) {
  return Math.random().toString(36).substr(2, len);
};

console.log(naiveUniqueString(10));
//=> "3rm6ww5w0x"

function uniqueString(prefix) {
  return [prefix, new Date().getTime()].join('');
}

console.log(uniqueString("argento"));
//=> "argento1356107740868"

function makeUniqueStringFunction(start) {
  var COUNTER = start;

  return function(prefix) {
    return [prefix, COUNTER++].join('');
  }
};

var uniqueString = makeUniqueStringFunction(0);

console.log(uniqueString("dari"));
//=> "dari0"

console.log(uniqueString("dari"));
//=> "dari1"

// Unsafe option with object
var generator = {
  count: 0,
  uniqueString: function(prefix) {
    return [prefix, this.count++].join('');
  }
};

generator.uniqueString("bohr");
//=> bohr0

generator.uniqueString("bohr");
//=> bohr1

// Hide the counter generator to avoid being mutated but still poor solution
// A better solution (possibly with state monads?) will be presented later
var omgenerator = (function(init) {
  var COUNTER = init;

  return {
    uniqueString: function(prefix) {
      return [prefix, COUNTER++].join('');
    }
  };
})(0);

omgenerator.uniqueString("lichking-");
//=> "lichking-0"

var nums = [1,2,3,null,5];

// Numbers contains null!
console.log(_.reduce(nums, function(total, n) { return total * n }));
//=> 0

function fnull(fun /*, defaults */) {
  var defaults = _.rest(arguments);

  return function(/* args */) {
    var args = _.map(arguments, function(e, i) {
      return existy(e) ? e : defaults[i];
    });

    return fun.apply(null, args);
  };
};

// The default implementation for multiplication is 1 * 1 = 1
var safeMult = fnull(function(total, n) { return total * n }, 1, 1);

console.log(_.reduce(nums, safeMult));
//=> 30

function defaults(d) {
  return function(o, k) {
    var val = fnull(_.identity, d[k]);
    return o && val(o[k]);
  };
}

function doSomething(config) {
  var lookup = defaults({critical: 108});

  return lookup(config, 'critical');
}

console.log(doSomething({critical: 9}));
//=> 9

console.log(doSomething({}));
//=> 108

// Using fnull helps avoid long sequence of guards at the beginning of of
// functions and the need of `o[k] || someDefault` pattern

// Verifies the validity of an object based on arbitrary criteria
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


var alwaysPasses = checker(always(true), always(true));
console.log(alwaysPasses({}));
//=> []

// It’s a bit of a pain to remember to set a message property on a validator
// every time you create one. Likewise, it would be nice to avoid putting
// properties on validators that you don’t own.
var fails = always(false);
fails.message = "a failure in life";
var alwaysFails = checker(fails);

console.log(alwaysFails({}));
//=> ["a failure in life"]


function validator(message, fun) {
  var f = function(/* args */) {
    return fun.apply(fun, arguments);
  };

  f['message'] = message;
  return f;
}

var gonnaFail = checker(validator("ZOMG!", always(false)));
console.log(gonnaFail(100)); //=> ["ZOMG!"]

function aMap(obj) {
  return _.isObject(obj);
}

var checkCommand = checker(validator("must be a map", aMap));

console.log(checkCommand({})); //=> true
console.log(checkCommand(42)); //=> ["must be a map"]

function cat() {
  var head = _.first(arguments);
  if (existy(head))
    return head.concat.apply(head, _.rest(arguments));
  else
    return [];
}

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

var checkCommand = checker(validator("must be a map", aMap), hasKeys('msg', 'type'));

console.log(checkCommand({msg: "blah", type: "display"}));
//=> []
console.log(checkCommand(32));
//=> ["must be a map", "Must have values for keys: msg type"]
console.log(checkCommand({}));
//=> ["Must have values for keys: msg type"]