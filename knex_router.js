
const express = require('express');
const route = express.Router();
const bodyParser = require('body-parser');
//const oracledb = require('oracledb');
//const logger = require('./logger');
require('dotenv').config();

var user = process.env.USER;
var password = process.env.PASSWORD;

/* var connAttrs = {
    "user": user,
    "password": password,
    "connectString": '100.100.100.19:1522/TIRGUL'
} */

const knex = require('knex')({
    client: 'oracledb',
    connection: {
        "user": user,
        "password": password,
        "connectString": '100.100.100.19:1522/TIRGUL'
    }
});

//knex.select("*").from("MESSAGES").orderBy(order_by, 'desc')

async function selectAllMessages(req, res) {

    try {
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

      result = await knex.select("*").from("MESSAGES").orderBy(order_by, 'desc')
      .then(console.log('GET /messages : Connection  success'));

    } catch (err) {
      //send error message
        res.status(500).json({
            status: 'fail',
            message: "Error getting the Message data",
            detailed_message: err.message
        });
        //logger.error('Error getting the Message data');

    } finally {
      if (!result) {
            //query return zero messages
            return res.send('query send no rows');
        } else {
        //send all messages
            res.status(200).json({
                status: 'ok', 
                message: '',
                payload: result, 
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
        var created_d = new Date();
        var updated_d = new Date();
        var m_key = Math.random().toString(36).substr(2, 4);

        var insert_message = {
           FROM_NAME: req.body.FROM_NAME,
           TO_NAME: req.body.TO_NAME,
           MESSAGE: req.body.MESSAGE,
           CREATED_AT: created_d,
           UPDATED_AT: updated_d,
           KEY: m_key
        };

        result = await knex("MESSAGES").insert(insert_message)
        .then(
            console.log("POST /messages : connection success")
        );  
  
    } catch (err) {
      //send error message
        res.status(400).json({
            status: 'fail',
            message: err.message.indexOf("ORA-00001") > -1 ? "Message already exists" : "Input Error",
            detailed_message: err.message
        });
        //logger.error(err.message.indexOf("ORA-00001") > -1 ? "Message already exists" : "Input Error");

    } finally {
        res.status(200).set('Location', '/messages/' + req.body.KEY).end();
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

      result = await knex("MESSAGES").where('key', req.params.MESSAGE_KEY).select("*")
      .then(
        console.log("GET /messages/" + req.params.MESSAGE_KEY + " : Connection  success")
      );
  
      //result = await connection.execute("SELECT * FROM MESSAGES WHERE KEY = :MESSAGE_KEY", [req.params.MESSAGE_KEY], {}, {outFormat: oracledb.OBJECT});  
  
    } catch (err) {
      //send error message
        res.status(500).json({
            status: 'fail',
            message: "Error getting the Message data",
            detailed_message: err.message
        });
        //logger.error('Error getting the Message data');

    } finally {
      if (!result) {
            //query return zero messages
            return res.send('query send no rows');
        } else {
        //send message data
            res.status(200).json({
                status: 'ok', 
                message: '',
                payload: result, 
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
/*       connection = await oracledb.getConnection(connAttrs);
      console.log('connected to database'); */

      result = await knex("MESSAGES").where("KEY",req.params.MESSAGE_KEY).del()
      .then(
        console.log("DELETE /messages/" + req.params.MESSAGE_KEY + " : Connection success")
      );  

      //result = await connection.execute("DELETE FROM MESSAGES WHERE KEY = :MESSAGE_KEY", [req.params.MESSAGE_KEY], {}, {autoCommit: true,outFormat: oracledb.OBJECT});  
  
    } catch (err) {
      //send error message
        res.status(500).json({
            status: 'fail',
            message: "Input Error",
            detailed_message: err.message
        });
        //logger.error("Input Error");

    } finally {

      if (result === 0) {
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