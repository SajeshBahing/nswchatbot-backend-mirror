module.exports = function(botkit) {
    //event for logging messages to file
    function logMessage(bot, message, next) {
        if (message.type === 'message') {
            let user_id = (typeof message.recipient === 'undefined') ? message.user : message.recipient.id;
            let sender = (typeof message.recipient === 'undefined') ? 'user' : 'bot';
            let session_id = botkit.plugins.manager.session(user_id).get('session_id');

            botkit.plugins.log.logMessageToFile(session_id, user_id, sender, message, (e) => { if (e) throw e });
        }

        next();
    }

    botkit.middleware.receive.use((bot, message, next) => logMessage(bot, message, next));

    botkit.middleware.send.use((bot, message, next) => logMessage(bot, message, next));
}