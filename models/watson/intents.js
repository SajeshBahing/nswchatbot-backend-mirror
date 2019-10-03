/**
 * Created by Navit on 15/11/16.
 */
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
var Config = require("../../config");

const intentModel = new Schema({
  workspace_id: { type: String},
  intent: {
    type: String,
    unique: true
  },
  description: {type: String},
  examples: [
    {text: {type: String}},
    {mentions: [{
      entity: {type:String},
      location: [{type:Number}]
      }]
    }
  ]
});

module.exports = mongoose.model("intentModel", intentModel);
