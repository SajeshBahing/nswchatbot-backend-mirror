import Config from '../../config';
import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";

const baseEndpointURL = '/api/admin/assistant';
const {STATUS_MSG} = Config.APP_CONSTANTS;
//TODO: Default should only work in Development

const runtime_intent = Joi.object().keys({
  intent: Joi.string().required(),
  confidence: Joi.number().required()
});

const runtime_entity = Joi.object().keys({
  entity: Joi.string(),
  location: Joi.array().items(Joi.number()),
  value: Joi.string(),
  confidence: Joi.number(),
  metadata: Joi.string(),
  groups: Joi.array().items({
    group: Joi.string().required(),
    location: Joi.array().items(Joi.number())
  }),
  interpretation: Joi.object().keys({
    calendar_type: Joi.string(),
    datetime_link: Joi.string(),
    festival: Joi.string(),
    granularity: Joi.string(),
    range_link: Joi.string(),
    range_modifier: Joi.string(),
    relative_day: Joi.number(),
    relative_month: Joi.number(),
    relative_week: Joi.number(),
    relative_year: Joi.number(),
    specific_day: Joi.number(),
    specific_day_of_week: Joi.string(),
    specific_month: Joi.number(),
    specific_quarter: Joi.number()
  })

});

const dialog_node_output_options_element_value = Joi.object().keys({
  input: Joi.object().keys({text: Joi.string().min(1).max(2048)}),
  intents: Joi.array().items(runtime_intent),
  entities: Joi.array().items(runtime_entity)
});

const dialog_node_output_options_element = Joi.object().keys({
  label: Joi.string().required(),
  value: dialog_node_output_options_element_value,
  message_to_human_agent: Joi.string(),
  query: Joi.string(),
  query_type: Joi.string(),
  filter: Joi.string(),
  discovery_version: Joi.string().default('2018-12-03')
});

const dialog_node_output_generic = Joi.object().keys({
  response_type: Joi.string().required(),
  values: Joi.array().items({
    text: Joi.string()
  }),
  selection_policy: Joi.string(),
  delimiter: Joi.string(),
  time: Joi.number(),
  typing: Joi.boolean(),
  source: Joi.string(),
  title: Joi.string(),
  description: Joi.string(),
  preference: Joi.string(),
  options: Joi.array().items({
    label: Joi.string().min(1).max(2048),
    value: Joi.array().items(
      dialog_node_output_options_element
    ),
    message_to_human_agent: Joi.string(),
    query: Joi.string(),
    query_type: Joi.string(),
    filter: Joi.string(),
    discovery_version: Joi.string().default('2018-12-03')
  }),

});

const dialog_node_output_modifiers = Joi.object().keys({
  overwrite: Joi.boolean().optional().default(true)
});

const dialog_node_output = Joi.object().keys({
  generic: Joi.array().items(
    dialog_node_output_generic
  ),
  modifiers: dialog_node_output_modifiers

});



const create_dialog_node = {
  workspace_id: Joi.string().default(Config.WATSON_CONFIG.assistantWorkspaceId),
  dialogNode: Joi.string().required(),
  newDialogNode: Joi.string().min(1).max(1024).optional(),
  newDescription: Joi.string().min(1).max(128).optional(),
  newConditions: Joi.string().min(1).max(2048).optional(),
  newParent: Joi.string().optional(),
  newPreviousSibling: Joi.string().optional(),
  output: dialog_node_output.optional(),
  context: Joi.string().optional(),
  metadata: Joi.string().optional(),
};



const values_array_validation = Joi.object().keys({
  value: Joi.string().min(1).max(64).required(),
  metadata: Joi.string().optional(),
  value_type: Joi.string().valid('synonyms','patterns').default('synonyms'),
  synonyms: Joi.array().items(Joi.string().min(1).max(64)).when('type',{is:'synonyms', then: Joi.required()}),
  patterns: Joi.array().items(Joi.string().min(1).max(512)).max(5).when('type',{is:'patterns',then: Joi.required()})
});

const update_overwrite_validation = {
  workspace_id: Joi.string().default(Config.WATSON_CONFIG.assistantWorkspaceId),
  dialog: Joi.string().min(1).max(64).required(),
  new_dialog: Joi.string().min(1).max(64).optional(),
  new_description: Joi.string().min(1).max(128),
  new_metadata: Joi.string(),
  new_fuzzy_match: Joi.boolean().optional(),
  new_values: Joi.array().items(
    values_array_validation
  ).required()
};

// Dialog APIs
const createDialogApi = {
  method: "POST",
  path: baseEndpointURL + "/dialogs/create",
  config: {
    description: "create dialogModel api",
    tags: ["api", "demo", 'watson', 'create', 'dialog'],
    handler: function (request, h) {
      let payloadData = request.payload;
      return new Promise((resolve, reject) => {
        Controller.WatsonDialogController.createDialog(payloadData, function (err, data) {
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
        dialog: Joi.string().min(1).max(64).required(),
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

// Updates the dialogModel examples
const updateDialogApi = {
  method: "PUT",
  path: baseEndpointURL + "/dialogs/update",
  config: {
    description: "overwrites the dialogModel examples",
    tags: ["api", "demo", 'watson', 'update', 'dialog'],
    handler: function (request, h) {
      var payloadData = request.payload;
      return new Promise((resolve, reject) => {
          Controller.WatsonDialogController.updateDialog(payloadData,(err, data) => {
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
const overwriteDialogApi = {
  method: "PUT",
  path: baseEndpointURL + "/dialogs/overwrite",
  config: {
    description: "overwrites the dialogModel examples",
    tags: ["api", "demo", 'watson', 'update', 'dialog'],
    handler: function (request, h) {
      var payloadData = request.payload;
      return new Promise((resolve, reject) => {
        Controller.WatsonDialogController.overwriteDialog(payloadData,(err,data) => {
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


// Get dialogs from watson
const getDialogApi = {
  method: "GET",
  path: baseEndpointURL + "/dialogs",
  config: {
    description: "get dialog from watson",
    tags: ["api", "demo", 'watson', 'get', 'dialog'],
    handler: function (request, h) {
      let query = request.query;
      return new Promise((resolve, reject) => {
        let q = {
          workspace_id: query.workspace_id,
          dialog: query.dialog,
          _export: query._export,
          include_audit: query.include_audit
        };
        Controller.WatsonDialogController.getDialog(q,(err, data) => {
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
        dialog: Joi.string().min(1).max(64).required(),
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

// Get dialogs from watson
const listEntitiesApi = {
  method: "GET",
  path: baseEndpointURL + "/dialogs/list",
  config: {
    description: "list dialog from watson",
    tags: ["api", "demo", 'watson', 'get', 'dialog'],
    handler: function (request, h) {
      let query = request.query;
      return new Promise((resolve, reject) => {
        Controller.WatsonDialogController.getDialog(query,(err, data) => {
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
        dialog: Joi.string().min(1).max(64).required(),
        _export: Joi.boolean().default(false),
        include_audit: Joi.boolean().default(false),
        page_limit: Joi.number().optional(),
        include_count: Joi.boolean().default(false),
        sort:Joi.string().valid('dialog','-dialog','updated','-updated').optional(),
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

// Get dialogs from watson
const deleteDialogApi = {
  method: "DELETE",
  path: baseEndpointURL + "/dialogs/delete",
  config: {
    description: "delete dialog from watson",
    tags: ["api", "demo", 'watson', 'get', 'dialog'],
    handler: function (request, h) {
      let query = request.query;
      return new Promise((resolve, reject) => {
        let q = {
          workspace_id: query.workspace_id,
          dialog: query.dialog
        };
        Controller.WatsonDialogController.getDialog(q,(err, data) => {
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
        dialog: Joi.string().min(1).max(64).required()
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
  createDialogApi,
  updateDialogApi,
  getDialogApi,
  deleteDialogApi,
  overwriteDialogApi,
  listEntitiesApi
];
module.exports = routes;
