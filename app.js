const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const route = require('./test_router');
const oracle_client = require('./oracle_client');
const logger = require('./logger');
require('dotenv').config()

const port = process.env.PORT;
const host = process.env.HOST;
console.log(port);
console.log(host);
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


var server = app.listen(port, () => {   // Run the server
    "use strict";

    console.log("Server started...");
    logger.info(`Server started and running on http://${host}:${port}`);
    oracle_client();

  })

/* {
    status: "ok", //ok, fail
    payload: {}, //{},[]
    errorMessage: "missing username"
} */