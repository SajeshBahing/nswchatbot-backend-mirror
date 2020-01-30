"use strict";

var Models = require("../models");

var addData = function(objToSave, callback) {
  new Models.Tracker(objToSave).save(callback);
};

var getData = function (criteria, projection, options, callback) {
  if (typeof options !== 'undefined')
      options.lean = true;
  Models.Tracker.find(criteria, projection, options, callback);
};



module.exports = {
  add: addData,
  get: getData
};
