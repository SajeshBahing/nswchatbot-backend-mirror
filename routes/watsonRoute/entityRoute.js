import Config from '../../config';
import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";

const baseEndpointURL = '/api/admin/assistant';
const {STATUS_MSG} = Config.APP_CONSTANTS;
//TODO: Default should only work in Development
//TODO: Update validation based on the new Entity Model.

// Entity APIs
export let createEntityApi = {
  method: "POST",
  path: baseEndpointURL + "/entities",
  config: {
    description: "create entityModel api",
    tags: ["api", "demo", 'watson', 'create', 'entity'],
    handler: function (request, h) {
      var payloadData = request.payload;
      return new Promise((resolve, reject) => {
        Controller.WatsonEntityController.createEntity(payloadData, function (err, data) {
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

        workspace_id: Joi.string().default(Config.WATSON_CONFIG.assistantWorkspaceId),
        entity: Joi.string().required(),
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

//   Updates/Overwrites the entityModel examples
export const updateEntityApi = {
  method: "PUT",
  path: baseEndpointURL + "/entities",
  config: {
    description: "overwrites the entityModel examples",
    tags: ["api", "demo", 'watson', 'update', 'entity'],
    handler: function (request, h) {
      var payloadData = request.payload;
      return new Promise((resolve, reject) => {
        if (!payloadData.overwrite)
          Controller.WatsonEntityController.updateEntity(payloadData,(err, data) => {
            if (err) reject(UniversalFunctions.sendError(err));
            else
            {
              resolve(UniversalFunctions
                .sendSuccess(STATUS_MSG.SUCCESS.DEFAULT, data));
            }
          });
        else
          Controller.WatsonEntityController.overwriteEntity(payloadData,(err,data) => {
            if (err) reject(UniversalFunctions.sendError(err));
            else
              resolve(
                UniversalFunctions.sendSuccess(STATUS_MSG.SUCCESS.DEFAULT, data)
              )
          });
      });
    },
    validate: {
      payload: {
        overwrite: Joi.boolean().optional().default(false),
        workspace_id: Joi.string().default(Config.WATSON_CONFIG.assistantWorkspaceId),
        entity: Joi.string().required(),
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

var routes = [createEntityApi,updateEntityApi];
module.exports = routes;
