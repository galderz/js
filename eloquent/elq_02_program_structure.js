// http://eloquentjavascript.net/02_program_structure.html

var caught = 5 * 5;
console.log(caught);

var ten = 10;
console.log(ten * ten);
// → 100

var mood = "light";
console.log(mood);
// → light
mood = "dark";
console.log(mood);
// → dark

var luigisDebt = 140;
luigisDebt = luigisDebt - 35;
console.log(luigisDebt);
// → 105

var one = 1, two = 2;
console.log(one + two);
// → 3

// Alert only defined for browser
// alert("Good morning!");

var x = 30;
console.log("the value of x is", x);
// → the value of x is 30

console.log(Math.max(2, 4));
// → 4

console.log(Math.min(2, 4) + 100);
// → 102

var number = 0;
while (number <= 12) {
  console.log(number);
  number = number + 2;
}

var result = 1;
var counter = 0;
while (counter < 10) {
  result = result * 2;
  counter = counter + 1;
}
console.log(result);
// → 1024

for (var number = 0; number <= 12; number = number + 2)
  console.log(number);

var result = 1;
for (var counter = 0; counter < 10; counter = counter + 1)
  result = result * 2;
console.log(result);
// → 1024

for (var current = 20; ; current++) {
  if (current % 7 == 0)
    break;
}
console.log(current);
// → 21

for (var number = 0; number <= 12; number += 2)
  console.log(number);

var weather = "rainy"
switch (weather) {
  case "rainy":
    console.log("Remember to bring an umbrella.");
    break;
  case "sunny":
    console.log("Dress lightly.");
  case "cloudy":
    console.log("Go outside.");
    break;
  default:
    console.log("Unknown weather type!");
    break;
}

console.log(7 / 7);