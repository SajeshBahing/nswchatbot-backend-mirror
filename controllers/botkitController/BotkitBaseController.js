let Config = require('../../config');
let botkit = Config.BOTKIT_CONFIG.botkit;
let watsonMiddleware = Config.BOTKIT_CONFIG.watsonMiddleware;
let URL = require('url').URL;
import { calculateDistances, getLocationData } from '../mapsController/CounselorController';
import { takeScreenshot } from '../../lib/ScreenshotManager';

require('./BotkitLogController');

async function userMeta(user_id) {
    const labels = ['username', 'email', 'phone', 'location'];
    
    return new Promise(async (resolve)=> {
        let context_ = {};
        for (let i = 0; i < labels.length; i++) {
            let value = await botkit.plugins.log.get(user_id, labels[i]);
            if(value !== '')
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
                    let common_options = ['video', 'pdf', 'link', 'social_media'];

                    if(gen.response_type === 'option' && common_options.includes(gen.title)) {
                        gen.options.forEach(async (option, ind) => {
                            watson_msg.generic[index].response_type = gen.title;
                        });

                    } else if (gen.response_type === 'option' && gen.title === 'counselor_map') {
                        let origin = botkit.plugins.manager.session(message.user).get('location');
                        if (origin === '') {
                            const context = await watsonMiddleware.readContext(message.user);
                            if (typeof context.location !== 'undefined') {
                                origin = context.location;
                            }
                        }
                        
                        //let spliced = watson_msg.generic.splice(index, 1);
                        if (typeof origin.latitude !== 'undefined')
                            origin = [origin.longitude, origin.latitude];
                        else { //use geocode to get longitude and latitude
                            origin = await getLocationData(origin);
                            //storing user's latitude and longitude instead of plain address
                            
                            let temp_origin = {longitude: origin[0], latitude: origin[1]};
                            botkit.plugins.manager.session(message.user).set('location', temp_origin); // storing in session
                            botkit.plugins.log.write(message.user, 'location', temp_origin); // storing in db
                        }

                        let data = await calculateDistances(origin);
                            
                        if (typeof data === 'object') {
                            watson_msg.generic[index].title = watson_msg.generic[index].description;
                            watson_msg.generic[index].options = data;
                            watson_msg.generic[index].response_type = 'counselor_map';
                        } else {
                            watson_msg.generic[index].title = 'Some error occured, please try again later';
                            watson_msg.generic[index].options = [];
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
