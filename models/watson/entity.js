/**
 * Created by Navit on 15/11/16.
 */
let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const entityModel = new Schema({
  workspace_id: {type: String},
  entity: {
    type: String,
    unique: true
  },
  description: {type: String},
  metadata:{type: String},
  fuzzy_match:{type: Boolean},
  values: [
    {
      value: {type: String},
      metadata:{type: String},
      value_type:{type: String},
      synonyms:[{type: String}],
      patterns: [{type: String}]
    }
  ]
});

module.exports = mongoose.model("entityModel", entityModel);
