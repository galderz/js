var Promise = require("promise");
var net = require('net');

//var connect = Promise.denodeify(net.connect);
//connect(11222, '127.0.0.1').then(function() {
//  console.log("Connected");
//}, function(error) {
//  console.log("Error connecting: " + error);
//});

var client = net.connect(11222, '127.0.0.1', function() {
  console.log('Connected');
});
client.on('error', function(err){
  console.log("Error connecting: " + err.message);
});
