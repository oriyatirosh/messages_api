const express = require('express');
const route = express.Router();
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const oracle_client = require('./oracle_client');
const logger = require('./logger');
require('dotenv').config();

var user = process.env.USER;
var password = process.env.PASSWORD;

var connAttrs = {
    "user": user,
    "password": password,
    "connectString": '100.100.100.19:1522/TIRGUL'
}

// Http Method: GET
// URI        : /messages
// Read all the messages
route.get('/messages', function (req, res) {
    "use strict";

    //oracle_client();

    oracledb.getConnection(connAttrs, function (err, connection) {
        //console.log(req.query.order);

        if (err) {
            // Error connecting to DB
            res.set('Content-Type', 'application/json');
            res.status(500).send(JSON.stringify({
                status: 'fail',
                message: "Error connecting to DB",
                detailed_message: err.message
            }));
            logger.error('Error connecting to DB');
            return;
        }
        var order_by ;


        if (req.query.order == "from_name") {
            order_by = "FROM_NAME";
        } else {
            if (req.query.order == "to_name") {
                order_by = "TO_NAME";
            } else {
                if (req.query.order == "created_at") {
                    order_by = "CREATED_AT";
                } else {
                    order_by = "ID";
                }
            }         
        }

        connection.execute("SELECT * FROM MESSAGES ORDER BY " + order_by, {}, {
            outFormat: oracledb.OBJECT // Return the result as Object
        }, function (err, result) {
            if (err) {
                res.set('Content-Type', 'application/json');
                res.status(500).send(JSON.stringify({
                    status: 'fail',
                    message: "Error getting the Message data",
                    detailed_message: err.message
                }));
                logger.error('Error getting the Message data');
            } else {
                res.contentType('application/json').status(200);
                //res.send(JSON.stringify(result.rows));
                res.send(JSON.stringify({
                    status: 'ok', 
                    message: '',
                    payload: result.rows, 
                }));
            }
            // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                        logger.error(err.message);
                    } else {
                        console.log("GET /messages : Connection released");
                        logger.info('GET /messages : Connection released');
                    }
                });
        });
    });
});

// Http method: POST
// URI        : /messages
// Creates a new Message data
route.post('/messages', function (req, res) {
    "use strict"; 

    if ("application/json" !== req.get('Content-Type')) {
        res.set('Content-Type', 'application/json').status(415).send(JSON.stringify({
            status: 'fail',
            message: "Wrong content-type. Only application/json is supported",
            detailed_message: null
        }));
        logger.error("Wrong content-type. Only application/json is supported");
        return;
    }  
    //console.log(req.body);


    if (req.body.FROM_NAME.length > 200 ||req.body.TO_NAME.length > 200) {

        res.set('Content-Type', 'application/json');
        res.status(415).send(JSON.stringify({
            status: 'fail',
            message: "Error in the integrity of field lengths",
            detailed_message: err.message
        }));
        logger.error("Error in the integrity of field lengths");
        return;
    }

    //oracle_client();

    oracledb.getConnection(connAttrs, function (err, connection) {
        if (err) {
            // Error connecting to DB
            res.set('Content-Type', 'application/json').status(500).send(JSON.stringify({
                status: 'fail',
                message: "Error connecting to DB",
                detailed_message: err.message
            }));
            logger.error("Error connecting to DB");
            return;
        }

        var created_d = new Date();
        var updated_d = new Date();
        var m_key = Math.random().toString(36).substr(2, 4);

        connection.execute("INSERT INTO MESSAGES (FROM_NAME, TO_NAME, MESSAGE, CREATED_AT, UPDATED_AT, KEY) VALUES " +
            "(:FROM_NAME, :TO_NAME, :MESSAGE, :CREATED_AT," +
            ":UPDATED_AT, :KEY) ",[req.body.FROM_NAME, req.body.TO_NAME,req.body.MESSAGE, created_d, updated_d,m_key], {
                autoCommit: true,
                outFormat: oracledb.OBJECT // Return the result as Object
            },
            function (err, result) {
                if (err) {
                    // Error
                    res.set('Content-Type', 'application/json');
                    res.status(400).send(JSON.stringify({
                        status: 'fail',
                        message: err.message.indexOf("ORA-00001") > -1 ? "Message already exists" : "Input Error",
                        detailed_message: err.message
                    }));
                    logger.error(err.message.indexOf("ORA-00001") > -1 ? "Message already exists" : "Input Error");
                } else {
                    // Successfully created the resource
                    console.log('Successfully created the resource');
                    res.status(201).set('Location', '/messages/' + req.body.KEY).end();
                    logger.info('Successfully created the resource');
                }
                // Release the connection
                connection.release(
                    function (err) {
                        if (err) {
                            console.error(err.message);
                            logger.error(err.message);
                        } else {
                            console.log("POST /messages : Connection released");
                            logger.info('POST /messages : Connection released');
                        }
                    });
            });
    });
});



// Http method: GET
// URI        : /messages/:MESSAGE_KEY
// Read the data of message given in :MESSAGE_KEY
route.get('/messages/:MESSAGE_KEY', function (req, res) {
    "use strict";

    //oracle_client();

    oracledb.getConnection(connAttrs, function (err, connection) {
        if (err) {
            // Error connecting to DB
            res.set('Content-Type', 'application/json');
            res.status(500).send(JSON.stringify({
                status: 'fail',
                message: "Error connecting to DB",
                detailed_message: err.message
            }));
            logger.error('Error connecting to DB');
            return;
        }

        connection.execute("SELECT * FROM MESSAGES WHERE KEY = :MESSAGE_KEY", [req.params.MESSAGE_KEY], {
            outFormat: oracledb.OBJECT // Return the result as Object
        }, function (err, result) {
            if (err || result.rows.length < 1) {
                res.set('Content-Type', 'application/json');
                var status = err ? 500 : 404;
                res.status(status).send(JSON.stringify({
                    status: 'fail',
                    message: err ? "Error getting the Message data" : "Message doesn't exist",
                    detailed_message: err ? err.message : ""
                }));
                logger.error(err ? "Error getting the Message data" : "Message doesn't exist");
            } else {
                res.contentType('application/json').status(200).send(JSON.stringify({
                    status: 'ok', 
                    payload: result.rows, 
                }));
            }
            // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                        logger.error(err.message);
                    } else {
                        console.log("GET /messages/" + req.params.MESSAGE_KEY + " : Connection released");
                        logger.info("GET /messages/" + req.params.MESSAGE_KEY + " : Connection released");
                    }
                });
        });
    });
});


// Http method: DELETE
// URI        : /messages/:MESSAGE_KEY
// Delete the data of messge given in :MESSAGE_KEY
route.delete('/messages/:MESSAGE_KEY', function (req, res) {
    "use strict";

    //oracle_client();

    oracledb.getConnection(connAttrs, function (err, connection) {
        if (err) {
            // Error connecting to DB
            res.set('Content-Type', 'application/json');
            res.status(500).send(JSON.stringify({
                status: 'fail',
                message: "Error connecting to DB",
                detailed_message: err.message
            }));
            logger.error("Error connecting to DB");
            return;
        }

        connection.execute("DELETE FROM MESSAGES WHERE KEY = :MESSAGE_KEY", [req.params.MESSAGE_KEY], {
            autoCommit: true,
            outFormat: oracledb.OBJECT
        }, function (err, result) {
            if (err || result.rowsAffected === 0) {
                // Error
                res.set('Content-Type', 'application/json');
                res.status(400).send(JSON.stringify({
                    status: 'fail',
                    message: err ? "Input Error" : "Message doesn't exist",
                    detailed_message: err ? err.message : ""
                }));
                logger.error(err ? "Input Error" : "Message doesn't exist");
            } else {
                // Resource successfully deleted. Sending an empty response body. 
                res.status(204).end(JSON.stringify({status: 'ok',message:'delete message success'}));
            }
             // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                        logger.error(err.message);
                    } else {
                        console.log("DELETE /messages/" + req.params.MESSAGE_KEY + " : Connection released");
                        logger.info("DELETE /messages/" + req.params.MESSAGE_KEY + " : Connection released");
                    }
                }); 

        });
    });
});

route.all('*', (req, res) => {
     res.status(404).end(JSON.stringify({
        status: 'fail',
        message: "error 404! resource not found",
    })); 
    logger.error("error 404! resource not found");
}) 


module.exports = route;