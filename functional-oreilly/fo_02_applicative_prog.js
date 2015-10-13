var _ = require("./underscore");

var lyrics = [];

// Imperative version
for (var bottles = 99; bottles > 0; bottles--) {
  lyrics.push(bottles + " bottles of beer on the wall");
  lyrics.push(bottles + " bottles of beer");
  lyrics.push("Take one down, pass it around");

  if (bottles > 1) {
    lyrics.push((bottles - 1) + " bottles of beer on the wall.");
  }
  else {
    lyrics.push("No more bottles of beer on the wall!");
  }
}

//console.log(lyrics);

// More functional version of the same program, first the internal logic
function lyricSegment(n) {
  return _.chain([])
      .push(n + " bottles of beer on the wall")
      .push(n + " bottles of beer")
      .push("Take one down, pass it around")
      .tap(function(lyrics) {
             if (n > 1)
               lyrics.push((n - 1) + " bottles of beer on the wall.");
             else
               lyrics.push("No more bottles of beer on the wall!");
           })
      .value();
}

//console.log(lyricSegment(9));

// Then, the repetition
function song(start, end, lyricGen) {
  return _.reduce(_.range(start,end,-1),
                  function(acc,n) {
                    return acc.concat(lyricGen(n));
                  }, []);
}

//console.log(song(99, 0, lyricSegment));


// Self references
var a = {name: "a", fun: function () { return this; }};

// fun() returns a reference to `a`
console.log(a.fun());
//=> {name: "a", fun: ...};

var bFunc = function () { return this };
var b = {name: "b", fun: bFunc};

//console.log(b.fun());
//=> some global object, probably Window

// Metaprogramming
function Point2D(x, y) {
  this._x = x;
  this._y = y;
}

console.log(new Point2D(0, 1));
//=> {_x: 0, _y: 1}

function Point3D(x, y, z) {
  Point2D.call(this, x, y);
  this._z = z;
}

console.log(new Point3D(10, -1, 100));
//=> {_x: 10, _y: -1, _z: 100}

var nums = [1,2,3,4,5];

function doubleAll(array) {
  return _.map(array, function(n) { return n*2 });
}

console.log(doubleAll(nums));
//=> [2, 4, 6, 8, 10]

function average(array) {
  var sum = _.reduce(array, function(a, b) { return a+b });
  return sum / _.size(array);
}

console.log(average(nums));
//=> 3

/* grab only even numbers in nums */
function onlyEven(array) {
  return _.filter(array, function(n) {
    return (n%2) === 0;
  });
}

console.log(onlyEven(nums));
//=> [2, 4]

// Identity returns its argument
// It would seem that _.map only deals with the value parts of the key/value pair,
// but this limitation is only a matter of use
console.log(_.map({a: 1, b: 2}, _.identity));

console.log(_.map({a: 1, b: 2}, function(v,k) {
  return [k,v];
}));
//=> [['a', 1], ['b', 2]]

// Another map option, taking the collection as parameter
console.log(_.map({a: 1, b: 2}, function(v,k,coll) {
  return [k, v, _.keys(coll)];
}));
//=> [['a', 1, ['a', 'b']], ['b', 2, ['a', 'b']]]

// reduce vs reduceRight
var nums = [100,2,25];

function div(x,y) { return x/y }

console.log(_.reduce(nums, div));
//=> 2 -> ((100 / 2) / 25)

console.log(_.reduceRight(nums, div));
//=> 0.125 -> ((2 / 25) / 100)

// If the function supplied to the reduce siblings is associative,
// then they wind up returning the same values

function allOf(/* funs */) {
  return _.reduceRight(arguments, function(truth, f) {
    return truth && f();
  }, true);
}

function anyOf(/* funs */) {
  return _.reduceRight(arguments, function(truth, f) {
    return truth || f();
  }, false);
}

function T() { return true }
function F() { return false }

console.log(allOf());
//=> true
console.log(allOf(T, T));
//=> true
console.log(allOf(T, T, T , T , F));
//=> false

console.log(anyOf(T, T, F));
//=> true
console.log(anyOf(F, F, F, F));
//=> false
console.log(anyOf());
//=> false

// The _.reduceRight function has further advantages in languages providing
// lazy evaluation, but since JavaScript is not such a language,
// evaluation order is the key factor

console.log(_.find(['a', 'b', 3, 'd'], _.isNumber));
//=> 3

console.log(_.reject(['a', 'b', 3, 'd'], _.isNumber));
//=> ['a', 'b', 'd']

function complement(pred) {
  return function() {
    return !pred.apply(null, _.toArray(arguments));
  };
}

console.log(_.filter(['a', 'b', 3, 'd'], complement(_.isNumber)));
//=> ['a', 'b', 'd']

console.log(_.all([1, 2, 3, 4], _.isNumber));
//=> true

console.log(_.any([1, 2, 'c', 4], _.isString));
//=> true

var people = [{name: "Rick", age: 30}, {name: "Jaka", age: 24}];

console.log(_.sortBy(people, function(p) { return p.age }));
//=> [{name: "Jaka", age: 24}, {name: "Rick", age: 30}]

var albums = [{title: "Sabbath Bloody Sabbath", genre: "Metal"},
  {title: "Scientist", genre: "Dub"},
  {title: "Undertow", genre: "Metal"}];

console.log(_.groupBy(albums, function(a) { return a.genre }));
//=> {Metal:[{title:"Sabbath Bloody Sabbath", genre:"Metal"},
//           {title:"Undertow", genre:"Metal"}],
//    Dub:  [{title:"Scientist", genre:"Dub"}]}

console.log(_.countBy(albums, function(a) { return a.genre }));
//=> {Metal: 2, Dub: 1}

function existy(x) { return x != null };

// Not applicative
function cat() {
  var head = _.first(arguments);
  if (existy(head))
    return head.concat.apply(head, _.rest(arguments));
  else
    return [];
}

console.log(cat([1,2,3], [4,5], [6,7,8]));
//=> [1, 2, 3, 4, 5, 6, 7, 8]

// Construct does not receiva cat as argument, so not applicative
function construct(head, tail) {
  return cat([head], _.toArray(tail));
}

construct(42, [1,2,3]);
//=> [42, 1, 2, 3]

// Mapcat is applicative since it takes a function
function mapcat(fun, coll) {
  return cat.apply(null, _.map(coll, fun));
}

console.log(mapcat(function(e) {
  return construct(e, [","]);
}, [1,2,3]));
//=> [1, ",", 2, ",", 3, ","]

function butLast(coll) {
  return _.toArray(coll).slice(0, -1);
}

function interpose(inter, coll) {
  return butLast(mapcat(function(e) {
    return construct(e, [inter]);
  }, coll));
}

console.log(interpose(",", [1,2,3]));

// Data thinking separate from Object having methods
var zombie = {name: "Bub", film: "Day of the Dead"};

console.log(_.keys(zombie));
//=> ["name", "film"]

console.log(_.values(zombie));
//=> ["Bub", "Day of the Dead"]

// The _.pluck function takes an array of objects and a string and
// returns all of the values at the given key for each object in
// the array
console.log(_.pluck([{title: "Chthon", author: "Anthony"},
      {title: "Grendel", author: "Gardner"},
      {title: "After Dark"}],
    'author'));

// “_.pairs that takes an object and turns it into this nested array
console.log(_.pairs(zombie));
//=> [["name", "Bub"], ["film", "Day of the Dead"]]

// This nested array view can be processed using sequential operations
// and reassembled into a new object using Underscore’s _.object function:
console.log(_.object(_.map(_.pairs(zombie), function(pair) {
  return [pair[0].toUpperCase(), pair[1]];
})));
//=> {FILM: "Day of the Dead", NAME: "Bub"};

console.log(_.invert(zombie));
//=> {"Bub": "name", "Day of the Dead": "film"}

// Javascript keys can only be Strings! So watch out:
console.log(_.keys(_.invert({a: 138, b: 9})));
//=> ['9', '138']

// _.defaults augments objects if properties are missing
console.log(_.pluck(_.map([{title: "Chthon", author: "Anthony"},
               {title: "Grendel", author: "Gardner"},
               {title: "After Dark"}],
       function(obj) {
         return _.defaults(obj, {author: "Unknown"})
       }),
   'author'));
//=> ["Anthony", "Gardner", "Unknown"]


var person = {name: "Romy", token: "j3983ij", password: "tigress"};
console.log(person);
//=> { name: 'Romy', token: 'j3983ij', password: 'tigress' }

// _.omit takes a black list of keys to remove, nondestructively
var info = _.omit(person, 'token', 'password');
console.log(info);
//=> {name: "Romy"}

// _.omit takes a white list of keys to take, nondestructively
var creds = _.pick(person, 'token', 'password');
console.log(creds);
//=> {password: "tigress", token: "j3983ij"};

var library = [{title: "SICP", isbn: "0262010771", ed: 1},
  {title: "SICP", isbn: "0262510871", ed: 2},
  {title: "Joy of Clojure", isbn: "1935182641", ed: 1}];

// finds first object to match criteria
_.findWhere(library, {title: "SICP", ed: 2});
//=> {title: "SICP", isbn: "0262510871", ed: 2}

// where operates on all the array and returns all objects that match the criteria
_.where(library, {title: "SICP"});
//=> [{title: "SICP", isbn: "0262010771", ed: 1},
//    {title: "SICP", isbn: "0262510871", ed: 2}]

// Result of pluck is a different abstraction from the table abstraction...
console.log(_.pluck(library, 'title'));
//=> ["SICP", "SICP", "Joy of Clojure"]

function project(table, keys) {
  return _.map(table, function(obj) {
    return _.pick.apply(null, construct(obj, keys));
  });
}

// Project the table
console.log(project(library, ['title']));

var editionResults = project(library, ['title', 'isbn']);
console.log(editionResults);
//=> [{isbn: "0262010771", title: "SICP"},
//    {isbn: "0262510871", title: "SICP"},
//    {isbn: "1935182641", title: "Joy of Clojure"}];

var isbnResults = project(editionResults, ['isbn']);
console.log(isbnResults);
//=> [{isbn: "0262010771"},{isbn: "0262510871"},{isbn: "1935182641"}]

console.log(_.pluck(isbnResults, 'isbn'));
//=> ["0262010771", "0262510871", "1935182641"]

function rename(obj, newNames) {
  return _.reduce(newNames, function(o, nu, old) {
      if (_.has(obj, old)) {
        o[nu] = obj[old];
        return o;
      }
      else
        return o;
    },
    _.omit.apply(null, construct(obj, _.keys(newNames))));
}

console.log(rename({a: 1, b: 2}, {'a': 'AAA'}));
//=> {AAA: 1, b: 2}

function as(table, newNames) {
  return _.map(table, function(obj) {
    return rename(obj, newNames);
  });
}

console.log(as(library, {ed: 'edition'}));
//=> [{title: "SICP", isbn: "0262010771", edition: 1},
//    {title: "SICP", isbn: "0262510871", edition: 2},
//    {title: "Joy of Clojure", isbn: "1935182641", edition: 1}]

console.log(project(as(library, {ed: 'edition'}), ['edition']));
//=> [{edition: 1}, {edition: 2}, {edition: 1}];

function truthy(x) { return (x !== false) && existy(x) }

function restrict(table, pred) {
  return _.reduce(table, function(newTable, obj) {
    if (truthy(pred(obj)))
      return newTable;
    else
      return _.without(newTable, obj);
  }, table);
}

console.log(restrict(library, function(book) {
  return book.ed > 1;
}));
//=> [{title: "SICP", isbn: "0262510871", ed: 2}]

// Restrict with chaining
console.log(restrict(
    project(
        as(library, {ed: 'edition'}),
        ['title', 'isbn', 'edition']),
    function(book) {
      return book.edition > 1;
    }));
//=> [{title: "SICP", isbn: "0262510871", edition: 2},]