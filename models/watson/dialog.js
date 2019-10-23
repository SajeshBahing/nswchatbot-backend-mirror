let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const CaptureGroup = new Schema({
  group: {type: String},
  location: [{type: Number}]
});

const RuntimeIntent = new Schema({
  intent: {type: String},
  confidence: {type: Number}
});

const RuntimeEntity = new Schema({
  entity: {type: String},
  location: {type: Number},
  value: {type: String},
  confidence: {type: String},
  metadata: {type: String},
  groups: [CaptureGroup]
});

const DialogNodeOutputOptionsElement = new Schema({
  label: {type: String},
  value: {
    input: {text: {type: String}},
    intents: [RuntimeIntent],
    entities: [RuntimeEntity]
  }
});

const DialogNodeOutputGeneric = new Schema({
  response_type: {type: String},
  values: [{text: {type:String}}],
  selection_policy: {type:String},
  delimiter: {type: String},
  time: {type: Number},
  typing: {type: Boolean},
  source: {type: String},
  title: {type: String},
  description: {type: String},
  preference: {type: String},
  options: [DialogNodeOutputOptionsElement],
  message_to_human_agent : {type: String},
  query: {type: String},
  query_type: {type: String},
  filter: {type: String},
  discovery_version: {type: String}
});


const DialogNodeNextStep = new Schema({
  behavior: {type:String},
  dialog_node: {type:String},
  selector: {type: String}
});

const DialogNodeAction = new Schema({
  name: {type:String},
  type:{type: String},
  parameters: {type: String},
  result_variable: {type: String},
  credentials: {type: String}
});

const dialogueModel = new Schema({
  workspace_id: { type: String},
  dialogNode: { type: String},
  description: {type: String},
  conditions: {type: String},
  parent: {type: String},
  previousSibling: {type: String},
  output:{
    generic:[DialogNodeOutputGeneric],
    modifiers: {overwrite: {type: Boolean}}
  },
  context: {type: String},
  metadata: {type: String},
  next_step: DialogNodeNextStep,
  title: {type:String},
  type: {type: String},
  event_name: {type: String},
  variable: {type:String},
  actions:[DialogNodeAction],
  digress_in: {type: String},
  digress_out: {type: String},
  user_label: {type: String},
  disabled: {type: Boolean},
  created: {type: String},
  updated: {type: String}
});

module.exports = mongoose.model("dialogueModel", dialogueModel);
