var winston = require('winston');

winston.log('info', 'Hello distributed log files!');
winston.info('Hello again distributed logs');

//winston.level = 'debug';
winston.log('debug', 'Now my debug messages are written to console!');

winston.log('info', 'Test Log Message', { anything: 'This is metadata' });

winston.log('info', 'test message %s', 'my string');
// info: test message my string

winston.log('info', 'test message %d', 123);
// info: test message 123

winston.log('info', 'test message %j', {number: 123}, {});

//var logger = new (winston.Logger)({
//  transports: [
//    new (winston.transports.Console)({
//      timestamp: function() {
//        return Date.now();
//      },
//      formatter: function(options) {
//        // Return string will be passed to logger.
//        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ (undefined !== options.message ? options.message : '') +
//          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
//      }
//    })
//  ]
//});
//logger.info('Data to log.');
