// http://eloquentjavascript.net/00_intro.html

console.log('hello world');

var total = 0, count = 1;
while (count <= 10) {
  total += count;
  count += 1;
}
console.log(total);
// → 55

function fac(n) {
  if (n == 0)
    return 1;
  else
    return fac(n - 1) * n;
}

console.log(fac(8));
// → 40320