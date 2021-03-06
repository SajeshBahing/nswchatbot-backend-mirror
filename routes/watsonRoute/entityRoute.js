import Config from '../../config';
import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";

const baseEndpointURL = '/api/admin/assistant';
const {STATUS_MSG} = Config.APP_CONSTANTS;
//TODO: Default should only work in Development


const values_array_validation = Joi.object().keys({
  value: Joi.string().min(1).max(64).required(),
  metadata: Joi.string().optional(),
  value_type: Joi.string().valid('synonyms','patterns').default('synonyms'),
  synonyms: Joi.array().items(Joi.string().min(1).max(64)).when('type',{is:'synonyms', then: Joi.required()}),
  patterns: Joi.array().items(Joi.string().min(1).max(512)).max(5).when('type',{is:'patterns',then: Joi.required()})
});

const update_overwrite_validation = {
  workspace_id: Joi.string().default(Config.WATSON_CONFIG.assistantWorkspaceId),
  entity: Joi.string().min(1).max(64).required(),
  new_entity: Joi.string().min(1).max(64).optional(),
  new_description: Joi.string().min(1).max(128),
  new_metadata: Joi.string(),
  new_fuzzy_match: Joi.boolean().optional(),
  new_values: Joi.array().items(
    values_array_validation
  ).required()
};

// Entity APIs
const createEntityApi = {
  method: "POST",
  path: baseEndpointURL + "/entities/create",
  config: {
    description: "create entityModel api",
    tags: ["api", "demo", 'watson', 'create', 'entity'],
    handler: function (request, h) {
      let payloadData = request.payload;
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
        entity: Joi.string().min(1).max(64).required(),
        description: Joi.string().min(1).max(128),
        metadata: Joi.string(),
        fuzzy_match: Joi.boolean().optional(),
        values: Joi.array().items(
          values_array_validation
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

// Updates the entityModel examples
const updateEntityApi = {
  method: "PUT",
  path: baseEndpointURL + "/entities/update",
  config: {
    description: "overwrites the entityModel examples",
    tags: ["api", "demo", 'watson', 'update', 'entity'],
    handler: function (request, h) {
      var payloadData = request.payload;
      return new Promise((resolve, reject) => {
          Controller.WatsonEntityController.updateEntity(payloadData,(err, data) => {
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
      payload: update_overwrite_validation,
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

// Overwrite
const overwriteEntityApi = {
  method: "PUT",
  path: baseEndpointURL + "/entities/overwrite",
  config: {
    description: "overwrites the entityModel examples",
    tags: ["api", "demo", 'watson', 'update', 'entity'],
    handler: function (request, h) {
      var payloadData = request.payload;
      return new Promise((resolve, reject) => {
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
      payload: update_overwrite_validation,
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
const getEntityApi = {
  method: "GET",
  path: baseEndpointURL + "/entities",
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
        Controller.WatsonEntityController.getEntity(q,(err, data) => {
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
const listEntitiesApi = {
  method: "GET",
  path: baseEndpointURL + "/entities/list",
  config: {
    description: "list entity from watson",
    tags: ["api", "demo", 'watson', 'get', 'entity'],
    handler: function (request, h) {
      let query = request.query;
      return new Promise((resolve, reject) => {
        Controller.WatsonEntityController.getEntity(query,(err, data) => {
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
const deleteEntityApi = {
  method: "DELETE",
  path: baseEndpointURL + "/entities/delete",
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

const routes = [
  createEntityApi,
  updateEntityApi,
  getEntityApi,
  deleteEntityApi,
  overwriteEntityApi,
  listEntitiesApi
];
module.exports = routes;
