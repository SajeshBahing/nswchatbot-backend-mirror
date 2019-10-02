/**
 * Created by Navit on 15/11/16.
 */
var UniversalFunctions = require("../../utils/universalFunctions");
var Joi = require("joi");
var Config = require("../../config");
var Controller = require("../../controllers");

// Message API
var sendMessageApi = {
  method: "POST",
  path: "/api/assistant/message",
  config: {
    description: "send Message Api",
    tags: ["api", "demo", 'watson', 'send', 'message'],
    handler: function(request, h) {
      var payloadData = request.payload;
      return new Promise((resolve, reject) => {
        Controller.WatsonIntentController.sendMessage(payloadData, function(
          err,
          data
        ) {
          if (err) reject(UniversalFunctions.sendError(err));
          else
            resolve(
              UniversalFunctions.sendSuccess(
                Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
                data
              )
            );
        });
      });
    },
    validate: {
      payload: {
        message: Joi.string().required()
      },
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      "hapi-swagger": {
        responseMessages:
          UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

// Workspace Api
var listWorkspacesApi = {
  method: "GET",
  path: "/api/assistant/admin/workspaces",
  config: {
    description: "list workspaces api",
    tags: ["api", "demo", 'watson', 'list', 'workspaces'],
    handler: function(request, h) {
      // var payloadData = request.payload;
      return new Promise((resolve, reject) => {
        Controller.WatsonIntentController.listWorkspaces(function(
          err,
          data
        ) {
          if (err) reject(UniversalFunctions.sendError(err));
          else
            resolve(
              UniversalFunctions.sendSuccess(
                Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
                data
              )
            );
        });
      });
    },
    // validate: {
    //   payload: {
    //     message: Joi.string().required()
    //   },
    //   failAction: UniversalFunctions.failActionFunction
    // },
    plugins: {
      "hapi-swagger": {
        responseMessages:
          UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};



var watsonDemoRoute = [listWorkspacesApi,sendMessageApi];
module.exports = watsonDemoRoute;
