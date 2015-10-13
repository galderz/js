// http://eloquentjavascript.net/10_modules.html

var names = ["Sunday", "Monday", "Tuesday", "Wednesday",
             "Thursday", "Friday", "Saturday"];
function dayName(number) {
  return names[number];
}

console.log(dayName(1));
// → Monday

// Function as a way to create a namespace
var dayName = function() {
  var names = ["Sunday", "Monday", "Tuesday", "Wednesday",
               "Thursday", "Friday", "Saturday"];
  return function(number) {
    return names[number];
  };
}();

console.log(dayName(3));
// → Wednesday

// Private function
(function() {
  function square(x) { return x * x; }
  var hundred = 100;

  console.log(square(hundred));
})();
// → 10000

// Not bad but annoying gathering all exported values at the end
var weekDay = function() {
  var names = ["Sunday", "Monday", "Tuesday", "Wednesday",
               "Thursday", "Friday", "Saturday"];
  return {
    name: function(number) { return names[number]; },
    number: function(name) { return names.indexOf(name); }
  };
}();

console.log(weekDay.name(weekDay.number("Sunday")));
// → Sunday

// This pattern still causes problems if multiple modules happen to claim the
// same name or if you want to load two versions of a module alongside each other.
(function(exports) {
  var names = ["Sunday", "Monday", "Tuesday", "Wednesday",
               "Thursday", "Friday", "Saturday"];

  exports.name = function(number) {
    return names[number];
  };
  exports.number = function(name) {
    return names.indexOf(name);
  };
})(this.weekDay = {});

console.log(weekDay.name(weekDay.number("Saturday")));
// → Saturday

// Evaluating data as code
// Using eval generally a bad idea, since it breaks properties of scopes
function evalAndReturnX(code) {
  eval(code);
  return x;
}

console.log(evalAndReturnX("var x = 2"));

// A better way, use Function constructor
var plusOne = new Function("n", "return n + 1;");
console.log(plusOne(4));
// → 5

