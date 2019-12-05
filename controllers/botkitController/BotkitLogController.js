let Config = require('../../config');
let botkit = Config.BOTKIT_CONFIG.botkit;
let watsonMiddleware = Config.BOTKIT_CONFIG.watsonMiddleware;

const moment = require('moment');

function logMessage(message) { 
    if (message.type === 'message') {
        let user_id = (typeof message.recipient === 'undefined') ? message.user : message.recipient.id;
        let session_id = botkit.plugins.manager.session(user_id).get('session_id');
        let message_content = typeof message.channelData === 'undefined' ? message.text : message.channelData.generic;
        let intents = typeof message.intents === 'undefined' ? [] : message.intents;
        let nodes = [];
        if (typeof message.channelData !== 'undefined' && typeof message.channelData.nodes_visited !== 'undefined') {
            nodes = message.channelData.nodes_visited;
        }

        let json_data = { 
            time : moment().toISOString(),
            session_id : session_id,
            user_id : user_id,
            nodes : nodes,
            intents : intents,
            message : message_content
        };

        botkit.plugins.log.logMessageToFile(
            session_id,
            user_id,
            json_data,
            (filters) => {
                if( nodes.some( el => filters.nodes.includes(el) ) ) {
                    return true;
                } else if (filters.messageTypes.includes(message.type)) {
                    return true;
                } else if ( intents.some( el => filters.intents.includes(el) ) ) {
                    return true;
                }
            }
        );
    }
}

//only logs message from bot
botkit.middleware.send.use((bot, message, next) => {
    logMessage(message);

    next();
});

watsonMiddleware.after = async (message, response) => {
    let intents = response.intents;
    message.intents = intents;

    logMessage(message);

    return response;
}
