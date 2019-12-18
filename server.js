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

let BotkitMiddleware = require('./controllers/botkitController/BotkitBaseController');

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
        handler: function (req, res) {
            return res.view("welcome");
        }
    });

    server.route(Routes);

    SocketManager.connectSocket(server);

    BootStrap.bootstrapAdmin(function (err) {
        if (err) console.log(err)
    });

    server.events.on("response", function (request) {
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


// Calls the init() function to start the server.
init();