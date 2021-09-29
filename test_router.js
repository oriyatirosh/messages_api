const express = require('express');
const route = express.Router();
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
//const logger = require('./logger');
require('dotenv').config();

var user = process.env.USER;
var password = process.env.PASSWORD;

var connAttrs = {
    "user": user,
    "password": password,
    "connectString": '100.100.100.19:1522/TIRGUL'
}

//---------------------- get
async function selectAllMessages(req, res) {

    try {
      connection = await oracledb.getConnection(connAttrs);
      console.log('connected to database');

      // run query to get all messages

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
      // Return the result as Object
      result = await connection.execute("SELECT * FROM MESSAGES ORDER BY " + order_by, {}, {outFormat: oracledb.OBJECT});  
  
    } catch (err) {
      //send error message
        res.status(500).json({
            status: 'fail',
            message: "Error getting the Message data",
            detailed_message: err.message
        });
        //logger.error('Error getting the Message data');

    } finally {
        if (connection) {
            try {
                // Always close connections
                await connection.close();
                console.log('GET /messages : Connection  success');
            } catch (err) {
                console.error(err.message);
            }
        }
      if (result.rows.length == 0) {
            //query return zero messages
            return res.send('query send no rows');
        } else {
        //send all messages
            res.status(200).json({
                status: 'ok', 
                message: '',
                payload: result.rows, 
            });
        }
  
    }
}
  
// Http Method: GET
// URI        : /messages
// Read all the messages
route.get('/messages', function (req, res) {
    selectAllMessages(req, res);
})

//---------------------- post
async function createNewMessage(req, res) {

    if ("application/json" !== req.get('Content-Type')) {
        res.status(415).json({
            status: 'fail',
            message: "Wrong content-type. Only application/json is supported",
            detailed_message: null
        });
        //logger.error("Wrong content-type. Only application/json is supported");
        return;
    } 

    if (req.body.FROM_NAME.length > 200 ||req.body.TO_NAME.length > 200) {
        res.status(415).json({
            status: 'fail',
            message: "Error in the integrity of field lengths",
            detailed_message: err.message
        });
        //logger.error("Error in the integrity of field lengths");
        return;
    }

    try {
        connection = await oracledb.getConnection(connAttrs);
        console.log('connected to database');

      // run query to get all messages

        var created_d = new Date();
        var updated_d = new Date();
        var m_key = Math.random().toString(36).substr(2, 4);

      // Return the result as Object
        result = await connection.execute("INSERT INTO MESSAGES (FROM_NAME, TO_NAME, MESSAGE, CREATED_AT, UPDATED_AT, KEY) VALUES " +
        "(:FROM_NAME, :TO_NAME, :MESSAGE, :CREATED_AT," +
        ":UPDATED_AT, :KEY) ",[req.body.FROM_NAME, req.body.TO_NAME,req.body.MESSAGE, created_d, updated_d,m_key], {
            autoCommit: true,
            outFormat: oracledb.OBJECT // Return the result as Object
        });  
  
    } catch (err) {
      //send error message
        res.status(400).json({
            status: 'fail',
            message: err.message.indexOf("ORA-00001") > -1 ? "Message already exists" : "Input Error",
            detailed_message: err.message
        });
        //logger.error(err.message.indexOf("ORA-00001") > -1 ? "Message already exists" : "Input Error");

    } finally {
        if (connection) {
            try {
                // Always close connections
                await connection.close();
                console.log("POST /messages : Connection released");
                res.status(200).set('Location', '/messages/' + req.body.KEY).end();
                //logger.info('Successfully created the resource');
            } catch (err) {
                console.error(err.message);
                //logger.error(err.message);
            }
        }
  
    }
}
  
// Http method: POST
// URI        : /messages
// Creates a new Message data
route.post('/messages', function (req, res) {
    createNewMessage(req, res);
})

//---------------------- get by message_key
async function selectByMessage_key(req, res) {

    try {
      connection = await oracledb.getConnection(connAttrs);
      console.log('connected to database');

      // Return the result as Object
      result = await connection.execute("SELECT * FROM MESSAGES WHERE KEY = :MESSAGE_KEY", [req.params.MESSAGE_KEY], {}, {outFormat: oracledb.OBJECT});  
  
    } catch (err) {
      //send error message
        res.status(500).json({
            status: 'fail',
            message: "Error getting the Message data",
            detailed_message: err.message
        });
        //logger.error('Error getting the Message data');

    } finally {
        if (connection) {
            try {
                // Always close connections
                await connection.close();
                console.log("GET /messages/" + req.params.MESSAGE_KEY + " : Connection released");
                //logger.info("GET /messages/" + req.params.MESSAGE_KEY + " : Connection released");
            } catch (err) {
                console.error(err.message);
                //logger.error(err.message);
            }
        }
      if (result.rows.length == 0) {
            //query return zero messages
            return res.send('query send no rows');
        } else {
        //send message data
            res.status(200).json({
                status: 'ok', 
                message: '',
                payload: result.rows, 
            });
        }
  
    }
}
  
// Http method: GET
// URI        : /messages/:MESSAGE_KEY
// Read the data of message given in :MESSAGE_KEY
route.get('/messages/:MESSAGE_KEY', function (req, res) {
    selectByMessage_key(req, res);
})


//---------------------- delete by message_key
async function DeleteByMessage_key(req, res) {

    try {
      connection = await oracledb.getConnection(connAttrs);
      console.log('connected to database');

      // Return the result as Object
      result = await connection.execute("DELETE FROM MESSAGES WHERE KEY = :MESSAGE_KEY", [req.params.MESSAGE_KEY], {}, {autoCommit: true,outFormat: oracledb.OBJECT});  
  
    } catch (err) {
      //send error message
        res.status(500).json({
            status: 'fail',
            message: "Input Error",
            detailed_message: err.message
        });
        //logger.error("Input Error");

    } finally {
        if (connection) {
            try {
                // Always close connections
                await connection.close();
                console.log("DELETE /messages/" + req.params.MESSAGE_KEY + " : Connection released");
                //logger.info("DELETE /messages/" + req.params.MESSAGE_KEY + " : Connection released");
            } catch (err) {
                console.error(err.message);
                //logger.error(err.message);
            }
        }
      if (result.rowsAffected === 0) {
            //query return zero messages
            res.status(400).json({
                status: 'fail',
                message:"Message doesn't exist",
            });
            //logger.error("Message doesn't exist");
        } else {
            //send message data
            res.status(200).json({status: 'ok',message:'delete message success'});
        }
  
    }
}
  
// Http method: DELETE
// URI        : /messages/:MESSAGE_KEY
// Delete the data of messge given in :MESSAGE_KEY
route.delete('/messages/:MESSAGE_KEY', function (req, res) {
    DeleteByMessage_key(req, res);
})

module.exports = route;