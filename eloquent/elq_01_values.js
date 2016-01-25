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

console.log(2 ^ 7);

console.log(0x00 & 0x80);
console.log(0x01 & 0x80);
console.log(0x02 & 0x80);
console.log(0x80 & 0x80);
console.log(0x81 & 0x80);
console.log(0x82 & 0x80);
console.log(0x83 & 0x80);

console.log(undefined == null);
console.log(0x0C == 12);
console.log(0x0C === 12);

console.log(Math.ceil(49 / 7));
console.log(Math.ceil(53 / 7));

console.log(0x60 | 0x07);

console.log(0x60 >> 4);
console.log(0x06 << 4);

var x = 1;
var y = x;
console.log(x);
console.log(y);
console.log(y++);
console.log(y);
console.log(x);

console.log(Buffer.byteLength("one"));
//console.log(Buffer.byteLength(undefined));

//console.log(0x60 & 0x9F); // 0110000 -> 1001111
//console.log(0x61 & 0x9F);

console.log((0x60 >> 4) & 0x06);
console.log((0x61 >> 4) & 0x06);
console.log((0x62 >> 4) & 0x06);
console.log((0x63 >> 4) & 0x06);
console.log((0x02 >> 4) & 0x06);
console.log((0x50 >> 4) & 0x06);

//console.log(0x60 & 0x90);
//console.log(0x61 & 0x90);
//console.log(0x62 & 0x90);
//console.log(0x63 & 0x90);
//console.log(0x64 & 0x90);
//console.log(0x02 & 0x90);
//console.log(0x50 & 0x90);