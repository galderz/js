var Promise = require('promise');
var p = Promise.resolve('foo');
var disposed = false;

var p1 = new Promise(function(resolve, reject) {
  resolve("Success");
});

p1.then(function(value) {
  console.log(value); // "Success!"
  throw "oh, no!";
}).catch(function(e) {
  console.log(e); // "oh, no!"
}).finally(function() {
  console.log("Completed");
});

//p1.then(function(value) {
//  console.log(value); // "Success!"
//  throw "oh, no!";
//}).then(undefined, function(e) {
//  console.log(e); // "oh, no!"
//});

//var p2 = p.then(function (value) {
//  if (Math.random() < 0.5) throw new Error('oops!');
//  else return value;
//}).catch(function (error) {
//  console.log(error);
//});
//
//console.log(p2);
//
//p2.finally(function () {
//  disposed = true; // always called
//}).then(function (value) {
//  console.log(value); // => "foo"
//}, function (err) {
//  console.log(err); // => oops!
//});

//p.then(function (value) {
//  if (Math.random() < 0.5) throw new Error('oops!');
//  else return value;
//}).finally(function () {
//  disposed = true; // always called
//}).then(function (value) {
//  console.log(value); // => "foo"
//}, function (err) {
//  console.log(err); // => oops!
//});