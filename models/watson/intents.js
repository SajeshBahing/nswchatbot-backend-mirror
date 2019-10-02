/**
 * Created by Navit on 15/11/16.
 */
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
var Config = require("../../config");

export const intentModel = new Schema({
  workspace_id: {
    type: String
  },
  intent: {
    type: String,
    unique: true
  },
  examples: [
    {
      text: {type: String}
    }
  ]
});

module.exports = mongoose.model("intentModel", intentModel);
