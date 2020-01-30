/**
 * Created by Navit on 15/11/16.
 */
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let Config = require("../config");

let tracker = new Schema({
  'user-unique-identifier': {type: String, trim: true, required: false},
  'user-app-name' : {type: String, trim: true, required: false},
  'user-agent' : {type: String, trim: true, required: false},
  'user-language' : {type: String, trim: true, required: false},
  'user-online' : {type: String, trim: true, required: false},
  'application-path' : {type: String, trim: true, required: false},
  'application-referer' : {type: String, trim: true, required: false},
  'application-title' : {type: String, trim: true, required: false},
  'user-country' : {type: String, trim: true, required: false},
  'user-country-code' : {type: String, trim: true, required: false},
  'user-ip-address' : {type: String, trim: true, required: false},
  'user-position': {type: Object, required: false},
  'timestamp' : {type: Date, required: true},
  'event': {type: String, trim: true, required: false},
  'link': {type: String, trim: true, required: false}
});

module.exports = mongoose.model("tracker", tracker);
