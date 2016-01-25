var log4js = require('log4js');
var logger = log4js.getLogger();
logger.debug("Some debug messages");
logger.info("Some debug messages");
logger.trace("Some debug messages");
logger.error("Error!!!");
logger.error("Error!!!", new Error("What happened?"));

