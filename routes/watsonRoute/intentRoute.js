import Config from '../../config';
import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";
import {getIntent} from "../../services/watson/intentService";

const baseEndpointURL = '/api/admin/assistant';
const {STATUS_MSG} = Config.APP_CONSTANTS;
//TODO: Update validation based on the new Intent Model.
//TODO: Default should only work in Development

// Intent APIs
export let createIntentApi = {
  method: "POST",
  path: baseEndpointURL + "/intents/create",
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
        workspace_id: Joi.string().default(Config.WATSON_CONFIG.assistantWorkspaceId),
        intent: Joi.string().required(),
        description: Joi.string().optional().min(1).max(128),
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
  path: baseEndpointURL + "/intents/update",
  config: {
    description: "overwrites the intentModel examples",
    tags: ["api", "demo", 'watson', 'update', 'intent'],

    handler: function (request, h) {
      var payloadData = request.payload;
      return new Promise((resolve, reject) => {
          Controller.WatsonIntentController.updateIntent(payloadData,(err, data) => {
            if (err) reject(UniversalFunctions.sendError(err));
            else
            {
              resolve(UniversalFunctions
                .sendSuccess(STATUS_MSG.SUCCESS.DEFAULT, data));
            }
          });
      });
    },

    validate: {
      payload: {
        workspace_id: Joi.string().default(Config.WATSON_CONFIG.assistantWorkspaceId),
        intent: Joi.string().required(),
        description: Joi.string().optional().min(1).max(128),
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
export const overwriteIntentApi = {
  method: "PUT",
  path: baseEndpointURL + "/intents/overwrite",

  config: {
    description: "overwrites the intentModel examples",
    tags: ["api", "demo", 'watson', 'update', 'intent'],

    handler: function (request, h) {
      var payloadData = request.payload;
      return new Promise((resolve, reject) => {
          Controller.WatsonIntentController.overwriteIntent(payloadData,(err,data) => {
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
        workspace_id: Joi.string().default(Config.WATSON_CONFIG.assistantWorkspaceId),
        intent: Joi.string().required(),
        description: Joi.string().optional().min(1).max(128),
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

// Get intents from watson
const getIntentApi = {
  method: "GET",
  path: baseEndpointURL + "/intents",
  config: {
    description: "get entity from watson",
    tags: ["api", "demo", 'watson', 'get', 'entity'],
    handler: function (request, h) {
      let query = request.query;
      return new Promise((resolve, reject) => {
        let q = {
          workspace_id: query.workspace_id,
          entity: query.entity,
          _export: query._export,
          include_audit: query.include_audit
        };
        Controller.WatsonIntentController.getIntent(q,(err, data) => {
          if (err) reject(UniversalFunctions.sendError(err));
          else
          {
            resolve(UniversalFunctions
              .sendSuccess(STATUS_MSG.SUCCESS.DEFAULT, data));
          }
        });
      });
    },
    validate: {
      //TODO: Switch to Intent
      query: {
        workspace_id: Joi.string().default(Config.WATSON_CONFIG.assistantWorkspaceId),
        entity: Joi.string().min(1).max(64).required(),
        _export: Joi.boolean().default(false),
        include_audit: Joi.boolean().default(false)
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

// Get entities from watson
//TODO: Entity to Intent
const listEntitiesApi = {
  method: "GET",
  path: baseEndpointURL + "/intents/list",
  config: {
    description: "list entity from watson",
    tags: ["api", "demo", 'watson', 'get', 'entity'],
    handler: function (request, h) {
      let query = request.query;
      return new Promise((resolve, reject) => {
        Controller.WatsonIntentController.listIntents(query,(err, data) => {
          if (err) reject(UniversalFunctions.sendError(err));
          else
          {
            resolve(UniversalFunctions
              .sendSuccess(STATUS_MSG.SUCCESS.DEFAULT, data));
          }
        });
      });
    },
    validate: {
      //TODO: Switch to Intent
      query: {
        workspace_id: Joi.string().default(Config.WATSON_CONFIG.assistantWorkspaceId),
        entity: Joi.string().min(1).max(64).required(),
        _export: Joi.boolean().default(false),
        include_audit: Joi.boolean().default(false),
        page_limit: Joi.number().optional(),
        include_count: Joi.boolean().default(false),
        sort:Joi.string().valid('entity','-entity','updated','-updated').optional(),
        cursor: Joi.string().optional()
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

// Get entities from watson
//TODO: Entity to Intent
const deleteEntityApi = {
  method: "DELETE",
  path: baseEndpointURL + "/intents/delete",
  config: {
    description: "delete entity from watson",
    tags: ["api", "demo", 'watson', 'get', 'entity'],
    handler: function (request, h) {
      let query = request.query;
      return new Promise((resolve, reject) => {
        let q = {
          workspace_id: query.workspace_id,
          entity: query.entity
        };
        Controller.WatsonEntityController.getEntity(q,(err, data) => {
          if (err) reject(UniversalFunctions.sendError(err));
          else {
            resolve(UniversalFunctions
              .sendSuccess(STATUS_MSG.SUCCESS.DEFAULT, data));
          }
        });
      });
    },
    validate: {
      query: {
        workspace_id: Joi.string().default(Config.WATSON_CONFIG.assistantWorkspaceId),
        entity: Joi.string().min(1).max(64).required()
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

const routes = [createIntentApi,updateIntentApi,overwriteIntentApi,getIntentApi,listEntitiesApi];
module.exports = routes;
