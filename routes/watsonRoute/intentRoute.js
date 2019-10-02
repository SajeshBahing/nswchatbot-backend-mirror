import Config from '../../config';
import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";

const baseEndpointURL = '/api/admin/assistant';
const {STATUS_MSG} = Config.APP_CONSTANTS;

// Intent APIs
export let createIntentApi = {
  method: "POST",
  path: baseEndpointURL + "/intents",
  config: {
    description: "create intentModel api",
    tags: ["api", "demo", 'watson', 'create', 'intent'],
    handler: function (request, h) {
      var payloadData = request.payload;
      return new Promise((resolve, reject) => {
        Controller.WatsonIntentController.createIntent(payloadData, function (err, data) {
          if (err) reject(UniversalFunctions.sendError(err));
          else
            resolve(UniversalFunctions
              .sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,data)
            );
        });
      });
    },
    validate: {
      payload: {
        workspace_id: Joi.string().required(),
        intent: Joi.string().required(),
        examples: Joi.array().items(
          Joi.object().keys({
            text: Joi.string().required()
          })
        ).required()
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

//   Updates/Overwrites the intentModel examples
export const updateIntentApi = {
  method: "PUT",
  path: baseEndpointURL + "/intents",
  config: {
    description: "overwrites the intentModel examples",
    tags: ["api", "demo", 'watson', 'update', 'intent'],
    handler: function (request, h) {
      var payloadData = request.payload;
      return new Promise((resolve, reject) => {
        if (!payloadData.overwrite)
          Controller.WatsonIntentController.updateIntent(payloadData,(err, data) => {
            if (err) reject(UniversalFunctions.sendError(err));
            else
            {
              resolve(UniversalFunctions
                .sendSuccess(STATUS_MSG.SUCCESS.DEFAULT, data));
            }
          });
        else
          Controller.WatsonIntentController.overwriteIntent(payloadData,(err,data) => {
            if (err) reject(UniversalFunctions.sendError(err));
            else
              resolve(
                UniversalFunctions.sendSuccess(Config)
              )
          });
      });
    },
    validate: {
      payload: {
        overwrite: Joi.boolean().optional().default(false),
        workspace_id: Joi.string().required(),
        intent: Joi.string().required(),
        examples: Joi.array().items(
          Joi.object().keys({
            text: Joi.string().required()
          })
        ).required()
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

var routes = [createIntentApi,updateIntentApi];
module.exports = routes;
