var _ = require("./underscore");

function splat(fun) {
  return function (array) {
    return fun.apply(null, array);
  };
}

var addArrayElements = splat(function (x, y) {
  return x + y
});

console.log(addArrayElements([1, 2]));
//=> 3”

function unsplat(fun) {
  return function () {
    return fun.call(null, _.toArray(arguments));
  };
}

var joinElements = unsplat(function (array) {
  return array.join(' ')
});

console.log(joinElements(1, 2));
//=> "1 2"

console.log(joinElements('-', '$', '/', '!', ':'));
//=> "- $ / ! :”

// Initial parseAge implementation which does too much
function parseAge(age) {
  if (!_.isString(age)) throw new Error("Expecting a string");
  var a;

  console.log("Attempting to parse an age");

  a = parseInt(age, 10);

  if (_.isNaN(a)) {
    console.log(["Could not parse age:", age].join(' '));
    a = 0;
  }

  return a;
}

parseAge("42");
// (console) Attempting to parse an age
//=> 42

function logError(f) {
  try {
    f.apply()
  } catch (e) {
    console.log(e);
  }
}

logError(function() { parseAge(42) });
// Error: Expecting a string

parseAge("frob");
// (console) Attempting to parse an age
// (console) Could not parse age: frob
//=> 0”

function fail(thing) {
  throw new Error(thing);
}

function warn(thing) {
  console.log(["WARNING:", thing].join(' '));
}

function note(thing) {
  console.log(["NOTE:", thing].join(' '));
}

// An improved version with errors, warnings...etc abstracted away
function parseAge(age) {
  if (!_.isString(age)) fail("Expecting a string");
  var a;

  note("Attempting to parse an age");
  a = parseInt(age, 10);

  if (_.isNaN(a)) {
    warn(["Could not parse age:", age].join(' '));
    a = 0;
  }

  return a;
}

parseAge("frob");

var letters = ['a', 'b', 'c'];

console.log(letters[1]);
//=> 'b'

function naiveNth(a, index) {
  return a[index];
}

console.log(naiveNth(letters, 1));
console.log(naiveNth({}, 1));

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

console.log(nth(letters, 1));
//=> 'b'

console.log(nth("abc", 0));
//=> "a"

logError(function() { nth({}, 2) });
// Error: Not supported on non-indexed type

logError(function() { nth(letters, 4000) });
// Error: Index value is out of bounds

logError(function() { nth(letters, 'aaaaa') });
// Error: Expected a number as the index

function second(a) {
  return nth(a, 1);
}

console.log(second(['a','b']));
//=> 'b'

console.log(second("fogus"));
//=> "o"

logError(function() { second({}) });
// Error: Not supported on non-indexed type

console.log([2, 3, -6, 0, -108, 42].sort());
//=> [-108, -6, 0, 2, 3, 42]

console.log([0, -1, -2].sort());
//=> [-1, -2, 0]

//The problem is that when given no arguments, the Array#sort method does a string comparison
console.log([2, 3, -1, -6, 0, -108, 42, 10].sort());
//=> [-1, -108, -6, 0, 10, 2, 3, 42]”

console.log([2, 3, -1, -6, 0, -108, 42, 10].sort(function(x,y) {
  if (x < y) return -1;
  if (y < x) return  1;
  return 0;
}));

//=> [-108, -6, -1, 0, 2, 3, 10, 42]

function compareLessThanOrEqual(x, y) {
  if (x < y) return -1;
  if (y < x) return  1;
  return 0;
}

console.log([2, 3, -1, -6, 0, -108, 42, 10].sort(compareLessThanOrEqual));
//=> [-108, -6, -1, 0, 2, 3, 10, 42]”

// A better comparator, returning Boolean, so predicate
function lessOrEqual(x, y) {
  return x <= y;
}

console.log([2, 3, -1, -6, 0, -108, 42, 10].sort(lessOrEqual));
//=> [100, 10, 1, 0, -1, -1, -2]

function existy(x) { return x != null };

console.log(existy(null));
//=> false

console.log(existy(undefined));
//=> false

console.log(existy({}.notHere));
//=> false

console.log(existy((function(){})()));
//=> false

console.log(existy(0));
//=> true

console.log(existy(false));
//=> true

function truthy(x) { return (x !== false) && existy(x) }

console.log(truthy(false));
//=> false

console.log(truthy(undefined));
//=> false

console.log(truthy(0));
//=> true

truthy('');
//=> true

function comparator(pred) {
  return function(x, y) {
    if (truthy(pred(x, y)))
      return -1;
    else if (truthy(pred(y, x)))
      return 1;
    else
      return 0;
  };
}

console.log([100, 1, 0, 10, -1, -2, -1].sort(comparator(lessOrEqual)));
//=> [-2, -1, -1, 0, 1, 10, 100]

console.log([100, 1, 0, 10, -1, -2, -1].sort(comparator(_.isEqual)));
//=> Result output does not make sense! You can't compare based on equality

function lameCSV(str) {
  return _.reduce(str.split("\n"), function(table, row) {
    table.push(_.map(row.split(","), function(c) { return c.trim()}));
    return table;
  }, []);
};

var peopleTable = lameCSV("name,age,hair\nMerble,35,red\nBob,64,blonde");

console.log(peopleTable);
//=> [["name",  "age",  "hair"],
//    ["Merble", "35",  "red"],
//    ["Bob",    "64",  "blonde"]]

console.log(_.rest(peopleTable).sort());

function selectNames(table) {
  return _.rest(_.map(table, _.first));
}

function selectAges(table) {
  return _.rest(_.map(table, second));
}

function selectHairColor(table) {
  return _.rest(_.map(table, function(row) {
    return nth(row, 2);
  }));
}

var mergeResults = _.zip

console.log(selectNames(peopleTable));
console.log(selectAges(peopleTable));
console.log(selectHairColor(peopleTable));
console.log(mergeResults(selectNames(peopleTable), selectAges(peopleTable)));

function doWhen(cond, action) {
  if(truthy(cond))
    return action();
  else
    return undefined;
}

function executeIfHasField(target, name) {
  return doWhen(existy(target[name]), function() {
    var result = _.result(target, name);
    console.log(['The result is', result].join(' '));
    return result;
  });
}
console.log(executeIfHasField([1,2,3], 'reverse'));
// (console) The result is 3, 2, 1
// => [3, 2, 1]

console.log(executeIfHasField({foo : 42}, 'foo'));
// (console) The result is 42
//=> 42

console.log(executeIfHasField([1,2,3], 'notHere'));
//=> undefined

console.log([null, undefined, 1, 2, false].map(existy));
//=> [false, false, true, true, true]
console.log([null, undefined, 1, 2, false].map(truthy));
//=> [false, false, true, true, false]

var duration = /(-?\d*\.?\d+(?:e[-+]?\d+)?)\s*([a-zμ]*)/ig
console.log("5m".match(duration))
console.log("555m".replace(duration, function(_, n, units) {
  console.log("Unit is: " + units);
  return n;
}));

console.log("1s".search(duration));

console.log(duration.exec('1s')[2]);
console.log(duration.exec('1m'));

function getPieces(str) {
  var pieces = [];
  var re = /(\d+)[\s,]*([a-zA-Z]+)/g, matches;
  while (matches = re.exec(str)) {
    pieces.push(+matches[1]);
    pieces.push(matches[2]);
  }
  return(pieces);
}

function getPieces2(str) {
  var re = /(\d+)[\s,]*([a-zμ]+)/g;
  var matches = re.exec(str);
  if (existy(matches)) return [matches[1], matches[2]];
  else {
    var num = parseInt(str);
    if (_.isNaN(num))
      throw new Error('`' + str + '` not a valid duration');
    else if (num > 0)
      throw new Error('Positive durations must be specified with time unit');

    return num;
  }
}

console.log(getPieces2('1ns'));
console.log(getPieces2('22μs'));
console.log(getPieces2('333ms'));
console.log(getPieces2('4444s'));
console.log(getPieces2('55555m'));
console.log(getPieces2('666666d'));

//console.log(getPieces2('1'));
console.log(getPieces2('0'));
console.log(getPieces2('-1'));

console.log(0 << 4 | 0);
console.log(1 << 4 | 0); // 00010000 (ms/s)
console.log(1 << 4 | 1); // 00010001 (ms/ms)
console.log(8 << 4 | 4); // 10000100 (ms/ms)
