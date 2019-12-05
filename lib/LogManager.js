'use strict';

var moment = require('moment');
var fs = require('fs');
var path = require('path');

const db = require('monk')(process.env.MONGO_URI);

export class LogManager {
    /**
     * Botkit Plugin name
     */
    constructor() {
        this.name = 'Botkit Log Manager';
    }
    
    init (botkit) {
        this.controller = botkit;
        this.filterIntent = {
            nodes: ['Welcome', 'Anything else'],
            messageTypes: ['session'],
            intents: []
        };
        botkit.addPluginExtension('log', this);
    }

    write(session_id, user_id, intent, data) {
        let json_data = {
            time : moment().toISOString(),
            session_id : session_id,
            user_id : user_id,
            location : data
        };

        const message_logs = db.get('location_logs');

        try {
            message_logs.update(
                {
                    'user_id' : user_id
                },
                { $set : json_data },
                {
                    'upsert' : true
                },
                (error, result) => {
                    if (result.nModified === 0) {
                        // new record inserted
                    } else {
                        //updated record
                    }
                }
            );
        } catch(err) {
            throw err;
        }
    }

    writeToMongoDb(session_id, user_id, cb) {
        let jsonPath = path.join(__dirname, '..', 'logs', user_id, session_id+'.json');
        // console.log(jsonPath);
        if (fs.existsSync(jsonPath)) {
            fs.readFile(jsonPath, 'utf-8', (err, data) => {
                if (err) throw err;

                data = JSON.parse(data);

                const message_logs = db.get('message_logs');

                console.log("Writing data to db....");
                
                try {
                    message_logs.insert(data);
                } catch (err) {
                    throw err;
                } finally {
                    fs.unlink(jsonPath, cb);
                }
            });
        }
    }

    verifyConnection(user, session_id, cb)
    {
        cb = typeof cb === 'undefined' ? () => {} : cb;

        //using interval as socker server's disconnect event doesnot seems to work
        let interval = setInterval(() => {    
            if (!this.controller.adapter.isConnected(user)) {
                this.writeToMongoDb(session_id, user, cb);

                clearInterval(interval);
            }
        }, 1000);
    }

    logMessageToFile(session_id, user_id, json_data, filter, cb) {

        if (filter(this.filterIntent)) {
          return;
        }

        if (typeof session_id === 'undefined') return;
        let jsonPath = path.join(__dirname, '..', 'logs', user_id);
        
        try {
            let file = path.join(jsonPath, session_id + '.json');
            
            if (!fs.existsSync(file)) {

                if (!fs.existsSync(jsonPath)){
                    fs.mkdirSync(jsonPath, { recursive: true });
                }

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
}

//update/insert code
// data.forEach((element) => {
//     message_logs.update(
//         {
//             'intent' : element.intent,
//             'user_id' : element.user_id
//         },
//         { $set : element },
//         {
//             'upsert' : true
//         },
//         (error, result) => {
//             if (result.nModified === 0) {
//                 // new record inserted
//             } else {
//                 //updated record
//             }
//         }
//     );
// });