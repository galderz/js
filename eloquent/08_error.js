// http://eloquentjavascript.net/08_error.html

"use strict";

function Person(name) { this.name = name; }
//var ferdinand = Person("Ferdinand"); // oops
var ferdinand = new Person("Ferdinand"); // oops
//console.log(name);
console.log(ferdinand.name);
// → Ferdinand

// Use strictness to get errors!
function canYouSpotTheProblem() {
  //"use strict";
  //for (counter = 0; counter < 10; counter++)
  for (var counter = 0; counter < 10; counter++)
    console.log("Happy happy");
}

canYouSpotTheProblem();
// → ReferenceError: counter is not defined

// Testing
function Vector(x, y) {
  this.x = x;
  this.y = y;
}
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};

function testVector() {
  var p1 = new Vector(10, 20);
  var p2 = new Vector(-10, 5);
  var p3 = p1.plus(p2);

  if (p1.x !== 10) return "fail: x property";
  if (p1.y !== 20) return "fail: y property";
  if (p2.x !== -10) return "fail: negative x property";
  if (p3.x !== 0) return "fail: x from plus";
  if (p3.y !== 25) return "fail: y from plus";
  return "everything ok";
}
console.log(testVector());
// → everything ok

// Debugging
function numberToString(n, base) {
  var result = "", sign = "";
  if (n < 0) {
    sign = "-";
    n = -n;
  }
  do {
    result = String(n % base) + result;
    //n /= base;
    n = Math.floor(n / base)
  } while (n > 0);
  return sign + result;
}
console.log(numberToString(13, 10));

// This allows `if (e instanceof InputError)` to be done on catched errors
function InputError(message) {
  this.message = message;
  this.stack = (new Error()).stack;
}
InputError.prototype = Object.create(Error.prototype);
InputError.prototype.name = "InputError";