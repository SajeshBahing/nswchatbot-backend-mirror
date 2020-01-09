let Config = require('../../config');
let botkit = Config.BOTKIT_CONFIG.botkit;
let watsonMiddleware = Config.BOTKIT_CONFIG.watsonMiddleware;

import { calculateDistances, getLocationData } from '../mapsController/CounselorController';
import { add as addAppointment } from '../../services/AppointmentService';
import { timeSheet } from '../counselorController/cousnselorAPIController';

function Events() {
    this.events = {};
    this.on = function (key, cb) {
        this.events[key] = cb;
    };
    this.triggerSync = function() {
        let parameters = Object.values(arguments);
        if (parameters.length > 0) {
            if (typeof this.events[parameters[0]]) {
                let event = parameters.splice(0, 1);
                return new Promise ((resolve, reject) => {
                    try {
                        let response = this.events[event](...parameters);
                        resolve(response);
                    } catch(error) {
                        reject(error);
                    }
                });
            }
            else {
                throw ('No such event registered');
            }
        }
        else {
            throw ('No parameters provided');
        }
    };
    this.trigger = function () {
        let parameters = Object.values(arguments);
        if (parameters.length > 0) {
            if (typeof this.events[parameters[0]]) {
                let event = parameters.splice(0, 1);
                return this.events[event](...parameters);
            }
            else {
                throw ('noe such event registered');
            }
        }
        else {
            throw ('No parameters provided');
        }
    };
    return this;
}

let eventHandler = new Events();

eventHandler.on('appointment_fixed', async (bot, message) => {

    let context = await watsonMiddleware.readContext(message.user);
    bot.reply(message, { sender_action: 'typing_on' });

    let date_ = new Date(context.appointment_date+" "+context.appointment_time);

    let appointment = {
        user_id : message.user,
        username : context.username,
        phone: context.phone,
        email: context.email,
        counselor: context.appointment_counselor,
        date: date_.toISOString()
    };

    let response = await timeSheet(context.appointment_date, context.appointment_time);
    
    if (response) {
        addAppointment(appointment);
    } else {
        delete context.appointment_date;
        delete context.appointment_time;

        try {
            const newMessage = { ...message };
            newMessage.text = 'see a counselor';

            await watsonMiddleware.updateContext(message.user, context);
            await watsonMiddleware.sendToWatson(bot, newMessage, context);

        } catch (error) {
            console.error(error);
        }
    }

    return response;
});

eventHandler.on('counselor_map', async function (message, watson_msg, index) {
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

        let temp_origin = { longitude: origin[0], latitude: origin[1] };
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

    return watson_msg;
});

export default eventHandler;