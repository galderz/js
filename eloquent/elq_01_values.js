// http://eloquentjavascript.net/01_values.html

// Both single and double quotes are valid
console.log("hello world");
console.log('hello world');

console.log("This is the first line\nAnd this is the second");
console.log("A newline character is written like \"\\n\".");
console.log("con" + "cat" + "e" + "nate");

console.log(typeof 4.5);
// → number
console.log(typeof "x");
// → string

console.log(- (10 - 2));
// → -8

console.log(3 > 2);
// → true
console.log(3 < 2);
// → false

console.log("Aardvark" < "Zoroaster");
// → true

console.log("Itchy" != "Scratchy");
// → true
console.log(NaN == NaN);
// → false
console.log(Infinity == Infinity);
// → true
console.log(-Infinity == -Infinity);
// → true

console.log(true && false);
// → false
console.log(true && true);
// → true

console.log(true ? 1 : 2);
// → 1
console.log(false ? 1 : 2);
// → 2

console.log(8 * null);
// → 0
console.log("5" - 1);
// → 4
console.log("5" + 1);
// → 51 (wtf!)
console.log("five" * 2);
// → NaN
console.log(false == 0);
// → true

console.log(null == undefined);
// → true
console.log(null == 0);
// → false

console.log(0 == false);
// → true (wtf!)
console.log("" == false);
// → true (wtf!)

// Use === and !== for strict equality comparisons
console.log(0 === false);
// → false (that's more like it!)
console.log("" === false);
// → false (that's more like it!)

console.log(null || "user");
// → user
console.log("Karl" || "user");
// → Karl

