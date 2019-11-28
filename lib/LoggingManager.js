'use strict';

var moment = require('moment');
var fs = require('fs');
var path = require('path');

const db = require('monk')(process.env.MONGO_URI);
const uuid = require('uuid/v1');

function writeToMongoDb(session_id, user_id, cb) {
    let jsonPath = path.join(__dirname, '..', 'logs', user_id, session_id+'.json');

    fs.readFile(jsonPath, 'utf-8', (err, data) => {
        if (err) throw err

        data = JSON.parse(data);

        const message_logs = db.get('message_logs');
        message_logs.insert(data).then(() => {
            console.log("Writing data to file....");
            fs.unlink(jsonPath, cb);
        }).catch((err) => {
            console.error(err.message);
        });
    });
}

export function verifyConnection(bot, message, cb)
{
    cb = typeof cb === 'undefined' ? () => {} : cb;
    let user = message.user;
    let uniqueSessionID = uuid();
    bot.controller.adapter.getConnection(message.user)['session_id'] = uniqueSessionID;
    //using interval as socker server's disconnect event doesnot seems to work
    let interval = setInterval(() => {    
        try {
            //checking connection to user
            bot.controller.adapter.getConnection(message.user);
        } catch (e) {
            if (e.message === 'User '+user+' is not connected') {
            //connection ended from user
            //save data to database
            writeToMongoDb(uniqueSessionID, user, cb);
            clearInterval(interval);
            }
        }
    }, 1000);
}

export function logMessageToFile(session_id, user_id, sender, message, cb) {
    let jsonPath = path.join(__dirname, '..', 'logs', user_id);
    let message_content = typeof message.channelData === 'undefined' ? message.text : message.channelData.generic;
    let json_data = {
        time : moment().toISOString(),
        session_id : session_id,
        user_id : user_id,
        sender : sender,
        message : message_content
    };

    try {
        let file = path.join(jsonPath, session_id + '.json');
        
        if (!fs.existsSync(file)) {
            fs.mkdirSync(jsonPath, { recursive: true });
            fs.writeFileSync(
                file,
                JSON.stringify([json_data]),
                'utf-8',
                typeof cb === 'undefined' ? () => {} : cb
            );
        } else {
            let data = fs.readFileSync(file, 'utf-8');

            let arrayOfObjects = JSON.parse(data);
            arrayOfObjects.push(json_data);

            fs.writeFileSync(
                file,
                JSON.stringify(arrayOfObjects),
                'utf-8',
                typeof cb === 'undefined' ? () => {} : cb
            );
        } 
    } catch (err) {
        throw err;
    }
}