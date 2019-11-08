/**
 * Created by Navit
 */

"use strict";
//External Dependencies
var Hapi = require("hapi");

//Internal Dependencies
var Config = require("./config");
var Plugins = require("./plugins");
// Initalises the Sockets, starts listening to a socket port.
var SocketManager = require("./lib/socketManager");
// registers the routes
var Routes = require("./routes");
// Initialises the connection to MongoDb Database
var MongoConnect = require('./mongoConnect');
// Creates SuperAdmins on the go!
var BootStrap = require('./utils/bootStrap');

const init = async () => {
  //Create Server
  var server = new Hapi.Server({
    // Configures and starts Hapi Server
    app: {
      name: process.env.APP_NAME
    },
    port: process.env.HAPI_PORT,
    // Enables cross origin resouce sharing
    routes: { cors: true }
  });

  //Register All Plugins
  await server.register(Plugins, {}, err => {
    if (err) {
      server.log(["error"], "Error while loading plugins : " + err);
    } else {
      server.log(["info"], "Plugins Loaded");
    }
  });

  //Add views
  await server.views({
    engines: {
      html: require("handlebars")
    },
    relativeTo: __dirname,
    path: "./views"
  });

  //Default Routes
  server.route({
    method: "GET",
    path: "/",
    handler: function(req, res) {
      return res.view("welcome");
    }
  });

  server.route(Routes);

  SocketManager.connectSocket(server);

  BootStrap.bootstrapAdmin(function(err){
    if(err) console.log(err)
  });

  server.events.on("response", function(request) {
    console.log(
      request.info.remoteAddress +
        ": " +
        request.method.toUpperCase() +
        " " +
        request.url.pathname +
        " --> " +
        request.response.statusCode
    );
    console.log("Request payload:", request.payload);
  });

  // Start Server
  await server.start();
  console.log("Server running on %s", server.info.uri);
};

// Catches the unhandled Rejection Event.
// process.on can register various events happening, like 'beforeExit', 'Exit', 'uncaughtException' etc.
process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});

// ######################################################################

import { WatsonMiddleware } from 'botkit-middleware-watson';

const { Botkit } = require('botkit');

const WebAdapter = require('botbuilder-adapter-web').WebAdapter;

const adapter = new WebAdapter();

const cont = new Botkit({
    adapter:adapter,
    webhook_uri: "/api/messages",
  });

const watsonMiddleware = new WatsonMiddleware({
  iam_apikey: process.env.ASSISTANT_IAM_APIKEY,
  url: process.env.ASSISTANT_URL,
  workspace_id: Config.WATSON_CONFIG.assistantWorkspaceId,
  version: '2019-02-28',
  minimum_confidence: 0.75, // (Optional) Default is 0.75
});

cont.middleware.receive.use(
  watsonMiddleware.receive.bind(watsonMiddleware),
);

// cont.before();

cont.on("welcome",async (bot, message) => {
  console.log("dskhsbdk"+JSON.stringify(message,null,2));
  message.watsonData.output = message.welcome_message? message.watsonData.output:'';
  return await bot.reply(message,message.watsonData.output);
});

cont.hears(
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

// cont.on()
// ######################################################################

// Calls the init() function to start the server.
init();
