var _ = require("./underscore");

// Recursive function, should not change the arguments
function myLength(ary) {
  if (_.isEmpty(ary))
    return 0;
  else
    return 1 + myLength(_.rest(ary));
}

console.log(myLength(_.range(10)));
//=> 10

console.log(myLength([]));
//=> 0

console.log(myLength(_.range(1000)));
//=> 1000

var a = _.range(10);

console.log(myLength(a));
//=> 10

console.log(a);
//=> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function cycle(times, ary) {
  if (times <= 0)
    return [];
  else
    return cat(ary, cycle(times - 1, ary));
}

console.log(cycle(2, [1,2,3]));
//=> [1, 2, 3, 1, 2, 3]

console.log(_.take(cycle(20, [1,2,3]), 11));
//=> [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2]

console.log(_.zip(['a', 'b', 'c'], [1, 2, 3]));
//=> [['a', 1], ['b', 2], ['c', 3]]

var zipped1 = [['a', 1]];

function existy(x) { return x != null }

function truthy(x) { return (x !== false) && existy(x) }

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

function constructPair(pair, rests) {
  return [construct(_.first(pair), _.first(rests)),
          construct(second(pair),  second(rests))];
}

console.log(constructPair(['a', 1], [[],[]]));
//=> [['a'], [1]]

console.log(_.zip(['a'], [1]));
//=> [['a', 1]]

console.log(_.zip.apply(null, constructPair(['a', 1], [[],[]])));
//=> [['a', 1]]

console.log(constructPair(['a', 1],
    constructPair(['b', 2],
        constructPair(['c', 3], [[],[]]))));
//=> [['a','b','c'],[1,2,3]]

function unzip(pairs) {
  if (_.isEmpty(pairs)) return [[],[]];

  return constructPair(_.first(pairs), unzip(_.rest(pairs)));
}

console.log(unzip(_.zip([1,2,3],[4,5,6]))); //=> [[1,2,3],[4,5,6]]

var influences = [
  ['Lisp', 'Smalltalk'],
  ['Lisp', 'Scheme'],
  ['Smalltalk', 'Self'],
  ['Scheme', 'JavaScript'],
  ['Scheme', 'Lua'],
  ['Self', 'Lua'],
  ['Self', 'JavaScript']];

function nexts(graph, node) {
  if (_.isEmpty(graph)) return [];

  var pair = _.first(graph);
  var from = _.first(pair);
  var to   = second(pair);
  var more = _.rest(graph);

  if (_.isEqual(node, from))
    return construct(to, nexts(more, node));
  else
    return nexts(more, node);
}

console.log(nexts(influences, 'Lisp'));
//=> ["Smalltalk", "Scheme"]

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

function depthSearch(graph, nodes, seen) {
  if (_.isEmpty(nodes)) return rev(seen);

  var node = _.first(nodes);
  var more = _.rest(nodes);

  if (_.contains(seen, node))
    return depthSearch(graph, more, seen);
  else
    return depthSearch(graph,
                       cat(nexts(graph, node), more),
                       construct(node, seen));
}

console.log(depthSearch(influences, ['Lisp'], []));
//=> ["Lisp", "Smalltalk", "Self", "Lua", "JavaScript", "Scheme"]

console.log(depthSearch(influences, ['Smalltalk', 'Self'], []));
//=> ["Smalltalk", "Self", "Lua", "JavaScript"]

console.log(depthSearch(construct(['Lua','Io'], influences), ['Lisp'], []));
//=> ["Lisp", "Smalltalk", "Self", "Lua", "Io", "JavaScript", "Scheme"]

// Tail-recursive, but these are not optimised away
function tcLength(ary, n) {
  var l = n ? n : 0;

  if (_.isEmpty(ary))
    return l;
  else
    return tcLength(_.rest(ary), l + 1);
}

console.log(tcLength(_.range(10)));
//=> 10

function T() {
  console.log("T() called!");
  return true
}
function F() {
  console.log("F() called!");
  return false
}

//console.log(true || T());
//console.log(true && T());
//console.log(false && T());

function anyOf(/* funs */) {
  return _.reduceRight(arguments, function(truth, f) {
    return truth || f();
  }, false);
}

function allOf(/* funs */) {
  return _.reduceRight(arguments, function(truth, f) {
    return truth && f();
  }, true);
}

// ((false || F) || T) || T)
console.log(anyOf(T, T, F));
//=> F() called!
//=> T() called!
//=> true

// ((false || T) || T) || T)
console.log(anyOf(T, T, T));
//=> T() called!
//=> true

// ((true && T) && F), F, F)
console.log(allOf(F, F, F, T));
//=>  T() called!
//=>  F() called!
//=> false

// Like checker in chapter 4, but recursive
// && shortcircuits
function andify(/* preds */) {
  var preds = _.toArray(arguments);

  return function(/* args */) {
    var args = _.toArray(arguments);

    var everything = function(ps, truth) {
      if (_.isEmpty(ps))
        return truth;
      else
        return _.every(args, _.first(ps))
            && everything(_.rest(ps), truth);
    };

    return everything(preds, true);
  };
}

function isEven(n) {
  console.log("isEven(" + n + ")");
  return (n%2) === 0
}

var evenNums = andify(_.isNumber, isEven);

console.log(evenNums(1,2));
// isEven(1)
//=> false

console.log(evenNums(2,4,6,8));
// isEven(2)
// isEven(4)
// isEven(6)
// isEven(8)
//=> true

console.log(evenNums(2,4,6,8,9));
// isEven(2)
// isEven(4)
// isEven(6)
// isEven(8)
// isEven(9)
//=> false

function orify(/* preds */) {
  var preds = _.toArray(arguments);

  return function(/* args */) {
    var args = _.toArray(arguments);

    var something = function(ps, truth) {
      if (_.isEmpty(ps))
        return truth;
      else
        return _.some(args, _.first(ps))
            || something(_.rest(ps), truth);
    };

    return something(preds, false);
  };
}

function isOdd(n) {
  console.log("isOdd(" + n + ")");
  return (n%2) === 1
}

function zero(n) {
  console.log("zero(" + n + ")");
  return n === 0
}

var zeroOrOdd = orify(zero, isOdd);
console.log(zeroOrOdd());
//=> false

console.log(zeroOrOdd(0,2,4,6));
// zero(0) <- short circuit!
//=> true

console.log(zeroOrOdd(2,4,6));
// zero(2)
// zero(4)
// zero(6)
// isOdd(2)
// isOdd(4)
// isOdd(6)
//=> false

function evenSteven(n) {
  if (n === 0)
    return true;
  else
    return oddJohn(Math.abs(n) - 1);
}

function oddJohn(n) {
  if (n === 0)
    return false;
  else
    return evenSteven(Math.abs(n) - 1);
}

console.log(evenSteven(4));
//=> true
console.log(oddJohn(11));
//=> true

// A better solution is to use Underscore's flatten
// In order to flatten a nested array, it builds an array of each of its
// nested elements and recursively concatenates each on the way back
// This is a fairly obscure use of mutual recursion, but one that fits well
// with the use of higher-order functions
function flat(ary) {
  if (_.isArray(ary))
    return cat.apply(cat, _.map(ary, flat));
  else
    return [ary];
}

console.log(flat([[1,2],[3,4]]));
//=> [1, 2, 3, 4]

console.log(flat([[1,2],[3,4,[5,6,[[[7]]],8]]]));
//=> [1, 2, 3, 4, 5, 6, 7, 8]

// Another example where recursion seems like a good fit is to implement a
// function to “deep” clone an object. Underscore has a _.clone function,
// but it’s “shallow” (i.e., it only copies the objects at the first level)

var x = [{a: [1, 2, 3], b: 42}, {c: {d: []}}];
var y = _.clone(x); //

console.log(y);
//=> [{a: [1, 2, 3], b: 42}, {c: {d: []}}];

x[1]['c']['d'] = 1000000;

console.log(y);
//=> [{a: [1, 2, 3], b: 42}, {c: {d: 1000000}}];

// While in many cases, _.clone will be useful, there are times when you’ll
// really want to clone an object and all of its subobjects. Recursion is a
// perfect task for this because it allows us to walk every object in a nested
// fashion, copying along the way. A recursive implementation of deepClone,
// while not robust enough for production use, is shown here:
function deepClone(obj) {
  if (!existy(obj) || !_.isObject(obj))
    return obj;

  var temp = new obj.constructor();
  for (var key in obj)
    if (obj.hasOwnProperty(key)) // to ensure that fields from prototype are not copied
      temp[key] = deepClone(obj[key]);

  return temp;
}

var x = [{a: [1, 2, 3], b: 42}, {c: {d: []}}];
console.log(x);

var y = deepClone(x);
console.log(_.isEqual(x, y));
//=> true

y[1]['c']['d'] = 42;

console.log(_.isEqual(x, y));
//=> false

// Traverse an array of nested arrays
function visit(mapFun, resultFun, ary) {
  if (_.isArray(ary))
    return resultFun(_.map(ary, mapFun));
  else
    return resultFun(ary);
}

console.log(visit(_.identity, _.isNumber, 42));
//=> true

console.log(visit(_.isNumber, _.identity, [1, 2, null, 3]));
//=> [true, true, false, true]

console.log(visit(function(n) { return n*2 }, rev, _.range(10)));
//=> [18, 16, 14, 12, 10, 8, 6, 4, 2, 0]

function partial1(fun, arg1) {
  return function(/* args */) {
    var args = construct(arg1, arguments);
    return fun.apply(fun, args);
  };
}

function postDepth(fun, ary) {
  return visit(partial1(postDepth, fun), fun, ary);
}

function preDepth(fun, ary) {
  return visit(partial1(preDepth, fun), fun, fun(ary));
}

console.log(postDepth(_.identity, influences));
//=> [['Lisp','Smalltalk'], ['Lisp','Scheme'], ...

console.log(postDepth(function(x) {
  if (x === "Lisp")
    return "LISP";
  else
    return x;
}, influences));

// Build an array of all of the languages that another language has influenced
// ^ Could be done more cleanly using high order functions
function influencedWithStrategy(strategy, lang, graph) {
  var results = [];

  strategy(function(x) {
    if (_.isArray(x) && _.first(x) === lang)
      results.push(second(x));

    return x;
  }, graph);

  return results;
}

console.log(influencedWithStrategy(postDepth, "Lisp", influences));
//=> ["Smalltalk", "Scheme"]

// Return a function that wraps the call to the mutually recursive function,
// instead of calling it directly. I can use partial1 as follows to achieve
// just that:
function evenOline(n) {
  if (n === 0)
    return true;
  else
    // Instead of calling: oddJohn(Math.abs(n) - 1)
    return partial1(oddOline, Math.abs(n) - 1);
}

function oddOline(n) {
  if (n === 0)
    return false;
  else
    return partial1(evenOline, Math.abs(n) - 1);
}

console.log(evenOline(0));
//=> true

console.log(oddOline(0));
//=> false

console.log(oddOline(3));
//=> function () { return evenOline(Math.abs(n) - 1) }

console.log(oddOline(3)());
//=> function () { return oddOline(Math.abs(n) - 1) }

console.log(oddOline(3)()());
//=> function () { return evenOline(Math.abs(n) - 1) }

console.log(oddOline(3)()()());
//=> true

console.log(oddOline(200000001)()()());
//... a bunch more ()s //=> true

function trampoline(fun /*, args */) {
  var result = fun.apply(fun, _.rest(arguments));

  while (_.isFunction(result)) {
    result = result();
  }

  return result;
}

console.log(trampoline(oddOline, 3));
//=> true

console.log(trampoline(evenOline, 200000));
//=> true

console.log(trampoline(oddOline, 300000));
//=> false

//console.log(trampoline(evenOline, 200000000));
// wait a few seconds
//=> true

// Because of the indirectness of the call chain, the use of a trampoline
// adds some overhead to mutually recursive functions. However, slow is
// usually better than exploding. Again, you might not want to force your
// users to use trampoline just to avoid stack explosions.

function isEvenSafe(n) {
  if (n === 0)
    return true;
  else
    return trampoline(partial1(oddOline, Math.abs(n) - 1));
}

function isOddSafe(n) {
  if (n === 0)
    return false;
  else
    return trampoline(partial1(evenOline, Math.abs(n) - 1));
}

console.log(isOddSafe(2000001));
//=>true

console.log(isEvenSafe(2000001));
//=> false

// In this call, the array created by cycle is definitely not lazy, because
// it is fully constructed before being passed to _.take. Even though _.take
// only needed 11 elements from the cycled array, a full 60 elements were
// generated. This is quite inefficient, but alas, the default in Underscore
// and JavaScript itself.
console.log(_.take(cycle(20, [1,2,3]), 11));
//=> [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2]

// A generator for an infinite list
function generator(seed, current, step) {
  return {
    head: current(seed),
    //  The key point about the tail value is that it’s wrapped in a function
    // and not “realized” until called
    tail: function() {
      console.log("forced");
      return generator(step(seed), current, step);
    }
  };
}

function genHead(gen) { return gen.head }
function genTail(gen) { return gen.tail() }

var ints = generator(0, _.identity, function(n) { return n+1 });

console.log(genHead(ints));
//=> 0

console.log(genTail(ints));
// (console) forced
//=> {head: 1, tail: function}

console.log(genTail(genTail(ints)));
// (console) forced
// (console) forced
//=> {head: 2, tail: function}

function partial(fun /*, pargs */) {
  var pargs = _.rest(arguments);

  return function(/* arguments */) {
    var args = cat(pargs, _.toArray(arguments));
    return fun.apply(fun, args);
  };
}

function genTake(n, gen) {
  var doTake = function(x, g, ret) {
    if (x === 0)
      return ret;
    else
      return partial(doTake, x-1, genTail(g), cat(ret, genHead(g)));
  };

  return trampoline(doTake, n, gen, []);
}

console.log(genTake(10, ints));
// (console) forced x 10
//=> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

//console.log(genTake(100, ints));
//// (console) forced x 100
////=> [0, 1, 2, 3, 4, 5, 6, ..., 98, 99]
//
//console.log(genTake(1000, ints));
//// (console) forced x 1000 //=> Array[1000]
//
//console.log(genTake(10000, ints));
//// (console) forced x 10000 // wait a second
////=> Array[10000]

// There is one fatal flaw with generators created with generator: while the
// tail cells are not calculated until accessed, they are calculated every
// time they are accessed
console.log(genTake(10, ints));
// (console) forced x 10
//=> [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function asyncGetAny(interval, urls, onsuccess, onfailure) {
  var n = urls.length;

  var looper = function(i) {
    setTimeout(function() {
      if (i >= n) {
        onfailure("failed");
        return;
      }

      $.get(urls[i], onsuccess)
          .always(function() { console.log("try: " + urls[i]) })
          .fail(function() {
                  looper(i + 1);
                });
    }, interval);
  }

  looper(0);
  return "go";
}

function curry2(fun) {
  return function(secondArg) {
    return function(firstArg) {
      return fun(firstArg, secondArg);
    };
  };
}

var groupFrom = curry2(_.groupBy)(_.first);
var groupTo   = curry2(_.groupBy)(second);

console.log(groupFrom(influences));
//=> {Lisp:[["Lisp", "Smalltalk"], ["Lisp", "Scheme"]],
//    Smalltalk:[["Smalltalk", "Self"]],
//    Scheme:[["Scheme", "JavaScript"], ["Scheme", "Lua"]],
//    Self:[["Self", "Lua"], ["Self", "JavaScript"]]}
console.log(groupTo(influences));
//=> {Smalltalk:[["Lisp", "Smalltalk"]],
//    Scheme:[["Lisp", "Scheme"]],
//    Self:[["Smalltalk", "Self"]],
//    JavaScript:[["Scheme", "JavaScript"], ["Self", "JavaScript"]],
//    Lua:[["Scheme", "Lua"], ["Self", "Lua"]]}

function influenced(graph, node) {
  return _.map(groupFrom(graph)[node], second);
}

influencedWithStrategy(preDepth, 'Lisp', influences);
//=> ["Smalltalk", "Scheme"]

// Not only does the implementation of influenced require far less code,
// but it’s also conceptually simpler.
influenced(influences, 'Lisp');
//=>["Smalltalk", "Scheme"]