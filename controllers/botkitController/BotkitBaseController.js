let Config = require('../../config');
let botkit = Config.BOTKIT_CONFIG.botkit;

botkit.on("conversation_start",async (bot, message) => {
  console.log("conversation_start: Welcome Message: \n\n"+JSON.stringify(message,null,2));
  message.watsonData.output = message.welcome_message? message.watsonData.output:'';
  return await bot.reply(message,message.watsonData.output);
});


botkit.hears(
  ['.*'],
  'message',
  async function(bot, message) {
    // console.log(">>>>>???????",message);
    if (message.watsonError) {
      await bot.reply(
        message,
        "I'm sorry, but for technical reasons I can't respond to your message",
      );
    } else {
      var watson_msg = message.watsonData.output;
      // console.log(message);
      console.log(watson_msg);
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
