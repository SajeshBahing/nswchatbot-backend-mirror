module.exports = function (botkit) {
    //event on welcome message
    botkit.on("welcome", async (bot, message) => {
        let uniqueSessionID = botkit.plugins.manager.session(message.user).get('session_id');
        
        if (typeof message.location !== 'undefined' && message.location != '') {
            botkit.plugins.manager.session(message.user).set('location', message.location);

            botkit.plugins.log.write(uniqueSessionID, message.user, ['location'], message.location);
        } else {
            await bot.reply(message, {'type': 'location', 'text' : 'Please provide us your address'});
            return;
        }

        botkit.plugins.log.verifyConnection(message.user, uniqueSessionID);

        message.watsonData.output = message.welcome_message ? message.watsonData.output : '';

        await bot.reply(message, {'type' : 'session', 'session_id': uniqueSessionID });
        return await bot.reply(message, message.watsonData.output);
    });

    //event on reconnect message
    botkit.on("reconnect", async (bot, message) => {
        //do session management here
        //possible setting session_id in connection variable will work
        botkit.plugins.manager.session(message.user, message.session);

        if (typeof message.location !== 'undefined' && message.location != '') {
            botkit.plugins.manager.session(message.user).set('location', message.location);

            botkit.plugins.log.write(message.session, message.user, ['location'], message.location);
        }

        botkit.plugins.log.verifyConnection(message.user, message.session);
    });

    botkit.on("location", async (bot, message) => {
        if (typeof message.location !== 'undefined' && message.location != '') {
            botkit.plugins.manager.session(message.user).set('location', message.location);

            botkit.plugins.log.write(message.session, message.user, ['location'], message.location);

            return await bot.reply(message, {
                type: 'message',
                text: 'Thank you for sharing your address.',
                generic : [
                    {
                        response_type: 'text',
                        text: "Thank you for sharing your address."
                    }                         
                ]
            });
        }
    });
};
