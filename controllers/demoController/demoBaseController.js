/**
 * Created by Navit
 */
var UniversalFunctions = require("../../utils/universalFunctions");
var async = require("async");
// let mapsClient = UniversalFunctions.CONFIG.MAPS_CONFIG.mapsClient;
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;

var demoFunction = function(payloadData, callback) {
  // mapsClient.distanceMatrix({origins: ['melbourne cbd'], destinations: ['sydney cbd']},
  //   function(err, response) {
  //   if (!err) {
  //     console.log(response.json.results);
  //     return callback(null,response.json.results);
  //   }else
  //     return callback(err);
  // });
};

var demoFunctionAuth = function(userData,payloadData, callback) {
  console.log(">>>>",userData,payloadData)
  return callback(null,payloadData);
};

module.exports = {
  demoFunction: demoFunction,
  demoFunctionAuth: demoFunctionAuth
};
