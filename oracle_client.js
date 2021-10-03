const oracledb = require('oracledb');
const logger = require('./logger');
require('dotenv').config();

var Dir = process.env.LIBDIR;

module.exports = function(s){
  try {
    oracledb.initOracleClient({libDir: Dir});
  } catch (err) {
    console.error('Whoops!');
    logger.error(err);
    throw error;
  }
}
