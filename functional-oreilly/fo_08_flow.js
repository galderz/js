var _ = require("./underscore");

function note(thing) {
  console.log(["NOTE:", thing].join(' '));
}

function existy(x) { return x != null }

function truthy(x) { return (x !== false) && existy(x) }

function cat() {
  var head = _.first(arguments);
  if (existy(head))
    return head.concat.apply(head, _.rest(arguments));
  else
    return [];
}

function curry2(fun) {
  return function(secondArg) {
    return function(firstArg) {
      return fun(firstArg, secondArg);
    };
  };
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

var rev = invoker('reverse', Array.prototype.reverse);

function rename(obj, newNames) {
  return _.reduce(newNames, function(o, nu, old) {
    if (_.has(obj, old)) {
      o[nu] = obj[old];
      return o;
    }
    else
      return o;
    }, _.omit.apply(null, construct(obj, _.keys(newNames))));
}

function as(table, newNames) {
  return _.map(table, function(obj) {
    return rename(obj, newNames);
  });
}

function project(table, keys) {
  return _.map(table, function(obj) {
    return _.pick.apply(null, construct(obj, keys));
  });
}

function restrict(table, pred) {
  return _.reduce(table, function(newTable, obj) {
    if (truthy(pred(obj)))
      return newTable;
    else
      return _.without(newTable, obj);
  }, table);
}

function validator(message, fun) {
  var f = function(/* args */) {
    return fun.apply(fun, arguments);
  };

  f['message'] = message;
  return f;
}

var zero = validator("cannot be zero", function(n) { return 0 === n });
var number = validator("arg must be a number", _.isNumber);

function sqr(n) {
  if (!number(n)) throw new Error(number.message);
  if (zero(n))    throw new Error(zero.message);

  return n * n;
}

function construct(head, tail) {
  return cat([head], _.toArray(tail));
}

///////////////////////////////////////////////////////////////////////////////

function createPerson() {
  var firstName = "";
  var lastName = "";
  var age = 0;

  return {
    setFirstName: function(fn) {
      firstName = fn;
      return this;
    },
    setLastName: function(ln) {
      lastName = ln;
      return this;
    },
    setAge: function(a) {
      age = a;
      return this;
    },
    toString: function() {
      return [firstName, lastName, age].join(' ');
    }
  };
}

console.log(createPerson()
    .setFirstName("Mike")
    .setLastName("Fogus")
    .setAge(108)
    .toString());

//=> "Mike Fogus 108"

var TITLE_KEY = 'title';

// ... a whole bunch of code later

var library = [{title: "SICP", isbn: "0262010771", ed: 1},
  {title: "SICP", isbn: "0262510871", ed: 2},
  {title: "Joy of Clojure", isbn: "1935182641", ed: 1}];

console.log(_.chain(library)
    .pluck(TITLE_KEY)
    .sort());

// What passes from one wrapper method call to the next is the wrapper object
// and not the target object itself. Therefore, whenever you want to end the
// call to _.chain and extract the final value, the _.value function is used:
console.log(_.chain(library)
    .pluck(TITLE_KEY)
    .sort()
    .value()); // chain

var TITLE_KEY = 'titel';
console.log(_.chain(library)
    .pluck(TITLE_KEY)
    .sort()
    .value()); // chain

//=> [undefined, undefined, undefined]

// In _.chain, there is seemingly no easy way to tap into the chain to
// inspect intermediate values. To help, Underscore provides a _.tap function
// that, given an object and a function, calls the function with the object
// and returns the object:

console.log(_.tap([1,2,3], note));
// NOTE: 1,2,3
//=> [1, 2, 3]

console.log(_.chain(library)
    .tap(function(o) {console.log(o)})
    .pluck(TITLE_KEY)
    .sort());
// [{title: "SICP" ...
//=> [undefined, undefined, undefined]

console.log(_.chain(library)
    .pluck(TITLE_KEY)
    .tap(note)
    .sort());
// NOTE: ,,
//=> [undefined, undefined, undefined]

// There is one limitation of _.chain, it’s not lazy.
// Even though I never explicitly asked for the wrapped value with the _.value
// function, all of the calls in the chain were executed anyway. If _.chain
// were lazy, then none of the calls would have occurred until the call to
// _.value:
console.log(_.chain(library)
    .pluck("title")
    .tap(note)
    .sort()); // chain
// NOTE: SICP,SICP,Joy of Clojure
//=> _

function LazyChain(obj) {
  this._calls  = [];
  this._target = obj;
}

// _calls array has a chain of functions
LazyChain.prototype.invoke = function(methodName /*, args */) {
  var args = _.rest(arguments);

  this._calls.push(function(target) {
    var meth = target[methodName];

    return meth.apply(target, args);
  });

  return this;
};

// Show what _calls has
console.log(new LazyChain([2,1,3]).invoke('sort')._calls);
//=> [function (target) { ... }]

// Call the queued up call, but how do you pass the original object in?
//console.log(new LazyChain([2,1,3]).invoke('sort')._calls[0]());
// TypeError: Cannot read property 'sort' of undefined

// Cheating by adding the object manually
console.log(new LazyChain([2,1,3]).invoke('sort')._calls[0]([2,1,3]));
//=> [1, 2, 3]

// Use _.reduce to provide loopback argument
LazyChain.prototype.force = function() {
  return _.reduce(this._calls, function(target, thunk) {
    return thunk(target);
  }, this._target);
};

console.log(new LazyChain([2,1,3]).invoke('sort').force());
//=> [1, 2, 3]

console.log(new LazyChain([2,1,3])
    .invoke('concat', [8,5,7,6])
    .invoke('sort')
    .invoke('join', ' ')
    .force());
//=> "1 2 3 5 6 7 8"

LazyChain.prototype.tap = function(fun) {
  this._calls.push(function(target) {
    fun(target);
    return target;
  });

  return this;
}

console.log(new LazyChain([2,1,3])
    .invoke('sort')
    .tap(note)
    .force());
// NOTE: 1,2,3
//=> "1,2,3"

// If we never calll force... Nothing happens!
var deferredSort = new LazyChain([2,1,3]).invoke('sort').tap(note);
console.log(deferredSort);
//=> LazyChain

// Extension to LazyChain that allows me to chain lazy chains to other lazy chains
function LazyChainChainChain(obj) {
  var isLC = (obj instanceof LazyChain);

  this._calls  = isLC ? cat(obj._calls, []) : [];
  this._target = isLC ? obj._target : obj;
}

LazyChainChainChain.prototype = LazyChain.prototype;

console.log(new LazyChainChainChain(deferredSort).invoke('toString').force());
// NOTE: 1,2,3
//=> "1,2,3"

// Promises, see Eloquent on Promises (or node.js)
//var longing = $.Deferred();
//
//function go() {
//  var d = $.Deferred();
//
//  $.when("")
//      .then(function() {
//              setTimeout(function() {
//                console.log("sub-task 1");
//              }, 5000)
//            })
//      .then(function() {
//              setTimeout(function() {
//                console.log("sub-task 2");
//              }, 10000)
//            })
//      .then(function() {
//              setTimeout(function() {
//                d.resolve("done done done done");
//              }, 15000)
//            })
//
//  return d.promise();
//}

function pipeline(seed /*, args */) {
  return _.reduce(_.rest(arguments),
                  function(l,r) { return r(l); },
                  seed);
};

console.log(
    pipeline([2, 3, null, 1, 42, false] , _.compact
    , _.initial
    , _.rest
    , rev));
//=> [1, 3]

// The pipeline looks like the following if written out as nested calls
console.log(rev(_.rest(_.initial(_.compact([2, 3, null, 1, 42, false])))));
//=> [1, 3]

// This description should start setting off alarms bells in you brain.
// That’s because this description is almost the same as the description of
// LazyChain#force. The same result/ call weaving is prevalent in both algorithms.
// Therefore, the implementation of pipe line should look very similar to
// LazyChain#force, and indeed it is, see above ^

// Pipeline examples:
console.log(pipeline()); //=> undefined
console.log(pipeline(42)); //=> 42
console.log(pipeline(42, function(n) { return -n })); //=> -42

// Pipelines are somewhat similar to lazy chains, except they are not lazy and
// they work against values rather than mutable references.

// Instead, pipelines are more akin to functions created using _.compose

// The act of making a pipeline lazy is simply the act of encapsulating it
// within a function (or thunk if you prefer)
function fifth(a) {
  return pipeline(a
      , _.rest
      , _.rest
      , _.rest
      , _.rest
      , _.first);
}

// The act of forcing a pipeline is just to feed it a piece of data
console.log(fifth([1,2,3,4,5])); //=> 5

// A very powerful technique is to use the abstraction built via a pipeline
// and insert it into another pipeline
function negativeFifth(a) {
  return pipeline(a
      , fifth
      , function(n) { return -n });
}

console.log(negativeFifth([1,2,3,4,5,6,7,8,9]));
//=> -5

// Pipeline lazy functions
function firstEditions(table) {
  return pipeline(table
      , function(t) { return as(t, {ed: 'edition'}) }
      , function(t) { return project(t, ['title', 'edition', 'isbn']) }
      , function(t) { return restrict(t, function(book) {
        return book.edition === 1;
      });
      });
}

console.log(firstEditions(library));
//=> [{title: "SICP", isbn: "0262010771", edition: 1},
//    {title: "Joy of Clojure", isbn: "1935182641", edition: 1}


// The problem is that the pipeline expects that the functions embedded within
// take a single argument. Since the relational operators expect two, an
// adapter function needs to wrap them in order to work within the pipeline.
// However, the relational operators were designed very specifically to
// conform to a consistent interface: the table is the first argument and the
// “change” specification is the second. Taking advantage of this consistency,
// I can use curry2 to build curried versions of the relational operators
// to work toward a more fluent experience:
var RQL = {
  select: curry2(project),
  as: curry2(as),
  where: curry2(restrict)
};

function allFirstEditions(table) {
  return pipeline(table
      , RQL.as({ed: 'edition'})
      , RQL.select(['title', 'edition', 'isbn'])
      , RQL.where(function(book) {
        return book.edition === 1;
      }));
}

var library = [{title: "SICP", isbn: "0262010771", ed: 1},
  {title: "SICP", isbn: "0262510871", ed: 2},
  {title: "Joy of Clojure", isbn: "1935182641", ed: 1}];

// Aside from being easier to read, the new allFirstEditions function will work just as well:
console.log(allFirstEditions(library));
//=> [{title: "SICP", isbn: "0262010771", edition: 1},
//    {title: "Joy of Clojure", isbn: "1935182641", edition: 1}

// The problem is that if the shapes do not align, then neither pipeline,
// _.compose, nor lazyChain will operate as expected.
console.log(pipeline(42
    , sqr
    , note // note returns undefined so it fails!
    , function(n) { return -n }));
// NOTE: 1764
//=> NaN

// In fact, if you want to achieve the correct effect, then you’d need to do so manually, e.g.:

function negativeSqr(n) {
  var s = sqr(n); note(n);
  return -s;
}
console.log(negativeSqr(42)); // NOTE: 1764 //=> -1764

// Could just change the note function to return whatever it’s given, and
// while that might be a good idea in general, doing so here would solve only
// a symptom rather than the larger disease of incompatible intermediate shapes.

// The actions function expects an array of functions, each taking a value and
// returning a function that augments the intermediate state object. The
// actions function then reduces over all of the functions in the array
// and builds up an intermediate state object.
// During this process, actions expects the result from each function to be an
// object of two keys: answer and state. The answer value corresponds to the
// result of calling the function and the state value represents what the new
// state looks like after the “action” is performed:
function actions(acts, done) {
  return function (seed) {
    var init = { values: [], state: seed };

    var intermediate = _.reduce(acts, function (stateObj, action) {
      var result = action(stateObj.state);
      var values = cat(stateObj.values, [result.answer]);

      return { values: values, state: result.state };
    }, init);

    var keep = _.filter(intermediate.values, existy);

    return done(keep, intermediate.state);
  };
};

// Create a sqr function that knows about state
function mSqr() {
  return function(state) {
    var ans = sqr(state);
    return {answer: ans, state: ans};
  }
}

var doubleSquareAction = actions(
    [mSqr(),
     mSqr()],
    function(values) {
      return values;
    });

// Since I returned the values array directly, the result of doubleSquareAction
// is all of the intermediate states (specifically the square of 10 and the
// square of the square of 10)
console.log(doubleSquareAction(10));
//=> [100, 10000]

// Create a note function that knows about state
function mNote() {
  return function(state) {
    note(state);
    return {answer: undefined, state: state};
  }
}

// Create a negative function that knows about state
function mNeg() {
  return function(state) {
    return {answer: -state, state: -state};
  }
}

var negativeSqrAction = actions([mSqr(), mNote(), mNeg()],
    function(_, state) {
      return state;
    });

console.log(negativeSqrAction(9));
// NOTE: 81
//=> -81

// Using the actions paradigm for composition is a general way to compose
// functions of different shapes. Sadly, the preceding code seems like a lot
// of ceremony to achieve the effects needed

// lift takes two functions: a function to provide the result of some action
// given a value, and another function to provide what the new state looks like.
// The lift function will be used to abstract away the management of the state
// object used as the intermediate representation of actions:
function lift(answerFun, stateFun) {
  return function(/* args */) {
    var args = _.toArray(arguments);

    return function(state) {
      var ans = answerFun.apply(null, construct(state, args));
      var s = stateFun ? stateFun(state) : ans;

      return {answer: ans, state: s};
    };
  };
};

// Using lift, I can more nicely redefine mSqr, mNote, and mNeg
var mSqr2  = lift(sqr);
var mNote2 = lift(note, _.identity);
var mNeg2  = lift(function(n) { return -n });

// In the case of sqr and the negation function, both the answer and the state
// are the same value, so I only needed to supply the answer function
// In the case of note, however, the answer (undefined) is clearly not the
// state value, so using _.identity allows me to specify that it’s a pass-through action

var negativeSqrAction2 = actions([mSqr2(), mNote2(), mNeg2()],
    function(_, state) {
      return state;
    });

console.log(negativeSqrAction2(100));
// NOTE: 10000
//=> -10000

// The push function returns a new array, masquerading as a stack, with the
// new element at the front. Since the intermediate state is also the answer,
// there is no need to supply a state function:
var push = lift(function(stack, e) { return construct(e, stack) });

// Since I’m simulating a stack via an array, the pop answer is the first
// element. Conversely, the state function _.rest return the new stack with
// the top element removed:
var pop = lift(_.first, _.rest);

var stackAction = actions([
      push(1),
      push(2),
      pop()
    ],
    function(values, state) {
      return values;
    });

console.log(stackAction([]));
//=> [[1], [2, 1], 2]


pipeline([]
    , stackAction
    , _.chain) // take stack actions and execute one at the time
  .each(function(elem) {
    // log each step
    console.log(elem)
   });
// (console) [[1],      // the stack after push(1)
// (console)  [2, 1],   // the stack after push(2)
// (console)  2]        // the result of pop([2, 1])


