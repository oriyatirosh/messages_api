const oracledb = require('oracledb');
//const knex = require('knex');
module.exports = function(s){
  try {
    oracledb.initOracleClient({libDir: 'C:\\oracle\\instantclient_19_11'});
  } catch (err) {
    console.error('Whoops!');
    console.error(err);
    logger.error(err);
    process.exit(1);
  }
}
