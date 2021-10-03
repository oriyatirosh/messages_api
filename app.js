const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const route = require('./knex_router');
const oracle_client = require('./oracle_client');
const logger = require('./logger');
require('dotenv').config()

const port = process.env.PORT;
const host = process.env.HOST;

// Use body parser
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }))

app.use('/api',route);

app.get('/',(req,res)=>{
    res.end('Routing App');
});

app.all('*', (req, res) => {

    res.status(404).end(JSON.stringify({
       status: 'fail',
       message: "error 404! resource not found",
   })); 
   logger.error("error 404! resource not found");

}) 
let start = async () => {
    try {
        oracle_client();
        var server = app.listen(port, () => {   // Run the server
            "use strict";
            logger.info(`Server started and running on http://${host}:${port}`);
        })
    } catch (error) {
        logger.error(error.message);
    }
};
start();
