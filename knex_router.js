
const express = require('express');
const route = express.Router();
const bodyParser = require('body-parser');
const knex = require('./knex_connection');
//const oracledb = require('oracledb');
const logger = require('./logger');

// Http Method: GET
// URI        : /messages
// Read all the messages
route.get('/messages', function (req, res) {
    selectAllMessages(req, res);
})

// Http method: POST
// URI        : /messages
// Creates a new Message data
route.post('/messages', function (req, res) {
    createNewMessage(req, res);
})

// Http method: GET
// URI        : /messages/:MESSAGE_KEY
// Read the data of message given in :MESSAGE_KEY
route.get('/messages/:MESSAGE_KEY', function (req, res) {
    selectByMessage_key(req, res);
})

// Http method: DELETE
// URI        : /messages/:MESSAGE_KEY
// Delete the data of messge given in :MESSAGE_KEY
route.delete('/messages/:MESSAGE_KEY', function (req, res) {
    DeleteByMessage_key(req, res);
})


async function selectAllMessages(req, res) {
    var result;
    try {
      // run query to get all messages

      var order_by ;
      var array = ["from_name", "to_name", "created_at"];

      if (array.includes(req.query.order)) {
        order_by = req.query.order.toUpperCase();
      } else {
        order_by = "ID";
      }

      result = await knex.select("*").from("MESSAGES").orderBy(order_by, 'desc').where(order_by, 'like', '%'+req.query.term+'%');
      logger.info('GET /messages : Connection  success');
      res.status(200).json({
        status: 'ok', 
        payload: result, 
      });

    } catch (err) {
      //send error message
        res.status(500).json({
            status: 'fail',
            message: "Error getting the Message data",
            detailed_message: err.message
        });
        logger.error('Error getting the Message data');
    }
}



//---------------------- post
async function createNewMessage(req, res) {
    var result;
    if ("application/json" !== req.get('Content-Type')) {
        res.status(415).json({
            status: 'fail',
            message: "Wrong content-type. Only application/json is supported",
            detailed_message: null
        });
        //logger.error("Wrong content-type. Only application/json is supported");
        return;
    } 
    if (!req.body.FROM_NAME||!req.body.TO_NAME){
        res.status(415).json({
            status: 'fail',
            message: "Error, Lack of message data",
            detailed_message: err.message
        });
        logger.error("Error, Lack of message data");
        return;
    }else{
        if (req.body.FROM_NAME.length > 200 ||req.body.TO_NAME.length > 200) {
            res.status(415).json({
                status: 'fail',
                message: "Error in the integrity of field lengths",
                detailed_message: err.message
            });
            logger.error("Error in the integrity of field lengths");
            return;
        }
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

        result = await knex("MESSAGES").insert(insert_message);  
        logger.info('message data insert create Successfully');
        res.status(200).json({
            status: 'ok',
            message: 'message data insert create Successfully',
        });

    } catch (err) {
      //send error message
        res.status(400).json({
            status: 'fail',
            message: err.message.indexOf("ORA-00001") > -1 ? "Message already exists" : "Input Error",
            detailed_message: err.message
        });
        logger.error(err.message.indexOf("ORA-00001") > -1 ? "Message already exists" : "Input Error");
    }
}
  


//---------------------- get by message_key
async function selectByMessage_key(req, res) {
    var result;
    try {

        result = await knex("MESSAGES").where("KEY", req.params.MESSAGE_KEY).select("*");
        logger.info("GET /messages/" + req.params.MESSAGE_KEY + " : Connection  success");
        //send message data
        res.status(200).json({
            status: 'ok', 
            payload: result, 
        });

    } catch (err) {
      //send error message
        res.status(500).json({
            status: 'fail',
            message: "Error getting the Message data",
            detailed_message: err.message
        });
        logger.error('Error getting the Message data');
    }
}
  


//---------------------- delete by message_key
async function DeleteByMessage_key(req, res) {
    var result;
    try {

        result = await knex("MESSAGES").where("KEY",req.params.MESSAGE_KEY).del()
        logger.info("DELETE /messages/" + req.params.MESSAGE_KEY + " : Connection success");

        if (result === 0) {
            //query return zero messages
            res.status(400).json({
                status: 'fail',
                message:"Message doesn't exist",
            });
            logger.error("Message doesn't exist");
        } else {
            //send message data
            res.status(200).json({status: 'ok',message:'delete message success'});
        }  

    } catch (err) {
      //send error message
        res.status(500).json({
            status: 'fail',
            message: "Input Error",
            detailed_message: err.message
        });
        //logger.error("Input Error");

    }
}

module.exports = route;