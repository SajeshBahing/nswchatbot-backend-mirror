module.exports = function (botkit) {
    //event on welcome message
    botkit.on("welcome", async (bot, message) => {
        let uniqueSessionID = botkit.plugins.manager.session(message.user, message.session).get('session_id');
        
        if (typeof message.location !== 'undefined' && message.location != '') {
            botkit.plugins.manager.session(message.user).set('location', message.location);

            botkit.plugins.log.write(message.user, 'location', message.location);
        }

        botkit.plugins.log.verifyConnection(message.user, uniqueSessionID);

        message.watsonData.output = message.welcome_message ? message.watsonData.output : '';

        
        await bot.reply(message, {'type' : 'session', 'session_id': uniqueSessionID });
        return await bot.reply(message, message.watsonData.output);
    });
};
