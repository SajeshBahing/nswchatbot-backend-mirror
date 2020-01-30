var {TrackerService} = require("../../services");
var UniversalFunctions = require("../../utils/universalFunctions");
var async = require("async");
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require("underscore");
var Config = require("../../config");
let moment = require('moment');

var logUserPageLand = function(payload, callback) {
  const response = new Promise((resolve, reject) => {
    payload = JSON.parse(payload);

    payload.timestamp = new Date();

    TrackerService.add(payload, (error, data) => {
        if (error)
            reject(error);
        else {
            resolve(data);
        }
    });
  });

  callback(response);
};

var getData = async function(callback) {
  const response = await new Promise((resolve, reject) => {
    TrackerService.get({}, null, {}, (err, data) => {
      if (err)
        console.error(err);

      resolve(data);
    });
  });

  callback(response);
};

module.exports = {
  logUserPageLand: logUserPageLand,
  getData: getData
};
