const uuid = require('uuid/v1');

let Config = require('../../config');
let botkit = Config.BOTKIT_CONFIG.botkit;
let watsonMiddleware = Config.BOTKIT_CONFIG.watsonMiddleware;
let URL = require('url').URL;
import {verifyConnection, logMessageToFile} from '../../lib/LoggingManager';
import {setSession, setSessionData, getSessionData} from '../../lib/SessionManager';

botkit.on("welcome", async (bot, message) => {
  let uniqueSessionID = setSession(bot, message.user);
  setSessionData(bot, message.user, 'location', message.location);

  verifyConnection(bot, message, uniqueSessionID); 

  message.watsonData.output = message.welcome_message? message.watsonData.output:'';

  await bot.reply(message, {'session_id': uniqueSessionID});
  return await bot.reply(message, message.watsonData.output);
});

botkit.on("reconnect", async (bot, message) => {
  //do session management here
  //possible setting session_id in connection variable will work
  setSessionData(bot, message.user, 'location', message.location);
  setSessionData(bot, message.user, 'session_id', message.session);

  verifyConnection(bot, message, message.session);
});

watsonMiddleware.before = (message, payload) => {
  var customerID = uuid();
  if (typeof message.user !== 'undefined') {
    customerID = message.user;
  }
  //some actions here
  payload = {...payload, headers : {'X-Watson-Metadata': 'customer_id=' + customerID}};

  return payload;
}

function logMessage(bot, message, next) {
  if (message.type === 'message') {
    let user_id = (typeof message.recipient === 'undefined') ? message.user : message.recipient.id;
    let sender = (typeof message.recipient === 'undefined') ? 'user' : 'bot';
    let session_id = bot.controller.adapter.getConnection(user_id).session_id;
    
    //console.log(bot.controller.plugins.sessionMgr.user(message).get('location'));
    logMessageToFile(session_id, user_id, sender, message, (e) => {if (e) throw e});
  }

  next();
}

botkit.middleware.receive.use ((bot, message, next) => logMessage(bot, message, next));

botkit.middleware.send.use ((bot, message, next) => logMessage(bot, message, next));

botkit.hears(
  ['.*'],
  'message',
  async function(bot, message) {
    //console.log(">>>>>???????",message);
    if (message.watsonError) {
      await bot.reply(
        message,
        "I'm sorry, but for technical reasons I can't respond to your message"
      );
    } else {
      var watson_msg = message.watsonData.output;
      // console.log(message);
      //console.log(watson_msg);
      // watson_msg.text = "abc";
      // watson_msg.generic[0].text = "asd";
      if( watson_msg.generic) {
        watson_msg.generic.forEach(gen => {
          if (gen.response_type === 'image'){
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

            if (youtube_aliases.some(x =>{
              url.hostname.includes(x)
            })){
              watson_msg.response_type = 'youtube_video'
            }else if (google_maps_aliases.some(x =>{
              url.hostname.includes(x)
            })){
              watson_msg.response_type = 'google_maps'
            }

          }
        });
      }

      await bot.reply(message, watson_msg);
    }
  },
);
