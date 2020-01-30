"use strict";

var Models = require("../models");

var addData = function(objToSave, callback) {
  new Models.Tracker(objToSave).save(callback);
};


module.exports = {
  add: addData
};
