let Config = require('../../config');
let botkit = Config.BOTKIT_CONFIG.botkit;
let watsonMiddleware = Config.BOTKIT_CONFIG.watsonMiddleware;
let URL = require('url').URL;

import eventHandler from './BotkitOptionsCotroller';

require('./BotkitLogController');

const processWatsonOnManualTrigger = async (bot, message) => {
    if (message.watsonError) {
        return await bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
    }
    if (typeof message.watsonData.output !== 'undefined') {
        //send "Please wait" to users
        if (message.watsonData.output.text.length > 0) {
            await bot.reply(message, message.watsonData.output);
        }

        if (message.learn_more) {
            const newMessage = { ...message };
            newMessage.text = 'Learn more';
            newMessage.learn_more = false;

            try {
                const contextDelta = message.watsonData.context;
                await watsonMiddleware.sendToWatson(bot, newMessage, contextDelta);
            } catch (error) {
                newMessage.watsonError = error;
            }
            return await processWatsonOnManualTrigger(bot, newMessage);
        }
    }
};

botkit.on("learn_more", processWatsonOnManualTrigger);

async function userMeta(user_id) {
    const labels = ['username', 'email', 'phone', 'location'];

    return new Promise(async (resolve) => {
        let context_ = {};
        for (let i = 0; i < labels.length; i++) {
            let value = await botkit.plugins.log.get(user_id, labels[i]);
            if (value !== '')
                context_[labels[i]] = value;
        }

        resolve(context_);
    });
}

watsonMiddleware.before = async (message, payload) => {
    if (message.welcome_message) {
        delete payload.context;

        payload.context = await userMeta(message.user);
    }

    if (typeof message.counselor !== 'undefined') {
        try {
            payload.context = { ...payload.context, ...{appointment_counselor : message.counselor} };
        } catch (error) {
            consolee.log(error);
        }
    }

    return payload;
}

botkit.middleware.receive.use(async (bot, message, next) => {
    if (typeof message.welcome_message === 'undefined') {
        let context = await watsonMiddleware.readContext(message.user);
        if (typeof context.location === 'undefined' && typeof message.location !== 'undefined') {
            context.location = message.location;

            await watsonMiddleware.updateContext(message.user, context);
        }
    }

    next();
});

async function iterateMessage(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

async function userDetails(user, options) {
    options.forEach((detail) => {
        if (detail.value.input.text) {
            botkit.plugins.log.write(user, detail.label, detail.value.input.text);
        }
    });
}

botkit.hears(
    ['.*'],
    'message',
    async function (bot, message) {
        if (message.watsonError) {
            await bot.reply(
                message,
                "I'm sorry, but for technical reasons I can't respond to your message"
            );
        } else {
            var watson_msg = message.watsonData.output;

            if (watson_msg.generic) {
                await iterateMessage(watson_msg.generic, async (gen, index) => {
                    let common_options = ['video', 'pdf', 'link', 'social_media'];

                    if (gen.response_type === 'text' && gen.text === '') {
                        watson_msg.generic.splice(index, 1);
                    }

                    if (gen.response_type === 'option' && common_options.includes(gen.title)) {
                        gen.options.forEach(async (option, ind) => {
                            watson_msg.generic[index].response_type = gen.title;
                        });
                    } else if (gen.response_type === 'option' && gen.title === 'video_playlist') {
                        gen.options.forEach(async (option, ind) => {
                            watson_msg.generic[index].title = option.label;
                            watson_msg.generic[index].response_type = 'video_playlist';
                        });
                    } else if (gen.response_type === 'option' && gen.title === 'counselor_map') {
                        //triggering counselor map event
                        watson_msg = await eventHandler.triggerSync('counselor_map', message, watson_msg, index);

                    } else if (gen.response_type === 'option' && gen.title === 'Gambling_calculator') {
                        watson_msg.generic.splice(index, 1);

                        let context = message.watsonData.context;

                        let calculator_data = {};

                        Object.keys(context).forEach( key => {
                            if (String(key).startsWith("gambling")) {
                                calculator_data[key] = context[key];
                            }
                        } );

                        //implement business logic to deterine the cost
                        eventHandler.trigger('GamblingCalculatorAndQuizData', message, calculator_data);
                        console.log(calculator_data);

                    } else if (gen.response_type === 'option' && gen.title === 'Gambling_quiz') {
                        watson_msg.generic.splice(index, 1);

                        let context = message.watsonData.context;

                        let quiz_data = {};

                        Object.keys(context).forEach( key => {
                            if (String(key).startsWith("quiz")) {
                                quiz_data[key] = context[key] == 'yes';
                            }
                        } );

                        //apply business logic to deterine if user is affected by gambling
                        eventHandler.trigger('GamblingCalculatorAndQuizData', message, quiz_data);
                        console.log(quiz_data);

                    } else if (gen.response_type === 'option' && gen.title === 'user_details_prompt') {

                        userDetails(message.user, gen.options);

                        watson_msg.generic.splice(index, 1);
                    } else if (gen.response_type === 'option' && gen.title === 'appointment_details') {

                        let response = await eventHandler.triggerSync('appointment_fixed', bot, message);
                        
                        watson_msg.generic.splice(index, 1);

                        if (!response) {
                            watson_msg.generic[0].text = 'Provided date and time is not available. Please select other date and time';

                            watson_msg.generic.splice(index, 2); 
                        }
                    }
                });
            }

            await bot.reply(message, watson_msg);
        }
    },
);
