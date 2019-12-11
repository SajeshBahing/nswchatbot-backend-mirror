let Config = require('../../config');
let botkit = Config.BOTKIT_CONFIG.botkit;
let watsonMiddleware = Config.BOTKIT_CONFIG.watsonMiddleware;
let URL = require('url').URL;

require('./BotkitLogController');
import { calculateDistances, getLocationData, getNearestCounselors } from '../mapsController/CounselorController';

watsonMiddleware.before = async (message, payload) => {
    if (message.welcome_message) {
        delete payload.context;
    }

    return payload;
}

botkit.middleware.receive.use(async (bot, message, next) => {
    if (typeof message.welcome_message === 'undefined') {
        let context = await watsonMiddleware.readContext(message.user);
        if(typeof context.location === 'undefined' && typeof message.location !== 'undefined') {
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
        if(detail.value.input.text) {
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
                    if (gen.response_type === 'image') {
                        //TODO:  check for youtube and maps
                        let url = new URL(gen.source);
                        let youtube_aliases = ['y2u.be',
                            'youtu.be',
                            'm.youtu.be',
                            'm.youtube.com',
                            'youtube.com',
                            'www.youtube.com'
                        ];

                        let google_maps_aliases = [''];

                        if (youtube_aliases.some(x => {
                            url.hostname.includes(x)
                        })) {
                            watson_msg.response_type = 'youtube_video'
                        } else if (google_maps_aliases.some(x => {
                            url.hostname.includes(x)
                        })) {
                            watson_msg.response_type = 'google_maps'
                        }

                    } else if (gen.response_type === 'option' && gen.title === 'counselor_map') {
                        let origin = botkit.plugins.manager.session(message.user).get('location');
                        if (origin === '') {
                            const context = await watsonMiddleware.readContext(message.user);
                            if (typeof context.location !== 'undefined') {
                                origin = context.location;
                                botkit.plugins.manager.session(message.user).set('location', origin);
                            }
                        }
                        let spliced = watson_msg.generic.splice(1, 1);
                        let data = await calculateDistances(origin);
                            
                        if (typeof data === 'object') {
                            watson_msg.generic[0].title = spliced[0].text;
                            watson_msg.generic[0].options = data;
                            watson_msg.generic[0].response_type = 'counselor_map';
                        } else {
                            watson_msg.generic[0].title = 'Some error occured, please try again later';
                            watson_msg.generic[0].options = [];
                        }

                    } else if (gen.response_type === 'option' && gen.title === 'user_details_prompt') {

                        userDetails(message.user, gen.options);

                        watson_msg.generic.splice(1, 1);
                    }
                });
            }
            
            await bot.reply(message, watson_msg);
        }
    },
);
