let Config = require('../../config');
let botkit = Config.BOTKIT_CONFIG.botkit;
let watsonMiddleware = Config.BOTKIT_CONFIG.watsonMiddleware;
let URL = require('url').URL;

// import { takeScreenshot } from '../../lib/ScreenshotManager';
import eventHandler from './BotkitOptionsCotroller';

require('./BotkitLogController');

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

                    } else if (gen.response_type === 'option' && gen.title === 'user_details_prompt') {

                        userDetails(message.user, gen.options);

                        watson_msg.generic.splice(index, 1);
                    } else if (gen.response_type === 'option' && gen.title === 'appointment_details') {

                        let response = await eventHandler.triggerSync('appointment_fixed', bot, message);
                        
                        watson_msg.generic.splice(index, 1);

                        if (!response)
                            watson_msg.generic[0].text = 'Provided date and time is not available. Please select other date and time';
                    }
                });
            }

            await bot.reply(message, watson_msg);
        }
    },
);
