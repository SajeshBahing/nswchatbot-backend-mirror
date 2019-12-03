module.exports = function(botkit) {

    //event for logging messages to file
    function logMessage(message, next) {

        if (message.type === 'message') {
            let user_id = (typeof message.recipient === 'undefined') ? message.user : message.recipient.id;
            let sender = (typeof message.recipient === 'undefined') ? 'user' : 'bot';
            let session_id = botkit.plugins.manager.session(user_id).get('session_id');

            botkit.plugins.log.logMessageToFile(
                session_id,
                user_id,
                sender,
                message,
                (e) => { if (e) throw e },
                (message) => {
                        if (
                          typeof message.channelData !== 'undefined' &&
                          typeof message.channelData.nodes_visited !== 'undefined'
                        ) {
                            if( message.channelData.nodes_visited.some( el => ['Welcome', 'Anything else'].includes(el) ) ) {
                              return true;
                            }
                        } else if (['session'].includes(message.type)) {
                            return true;
                        }
                    }
                );
        }

        next();
    }

    botkit.middleware.receive.use((bot, message, next) => {
        logMessage(message, next);
    });

    botkit.middleware.send.use((bot, message, next) => {
        logMessage(message, next);
    });
}
