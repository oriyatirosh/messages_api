require('dotenv').config();

var user = process.env.USER;
var password = process.env.PASSWORD;
var connectString = process.env.CONNECTSTRING;

const knex = require('knex')({
    client: 'oracledb',
    connection: {
        "user": user,
        "password": password,
        "connectString": connectString
    }
});

module.exports = knex;