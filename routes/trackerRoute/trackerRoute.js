import Config from '../../config';
import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";

const postPageLand = {
    method: "POST",
    path: "/api/tracker/land",
    config: {
        description: "Log user's page visit",
        tags: ["api", "demo", 'post'],
        handler: async function (request, h) { 
          var payloadData = request.payload;
          
          return new Promise((ressolve, reject) => {
            Controller.TrackerController.logUserPageLand(payloadData, (response) => {
              ressolve(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, response);
            });
          });
        }
    }
};

const getTrackerData = {
  method: "get",
  path: "/api/tracker",
  config: {
      description: "get all tracking data",
      tags: ["api", "demo", 'post'],
      handler: async function (request, h) { 
        return new Promise((ressolve, reject) => {
          Controller.TrackerController.getData((response) => {
            ressolve(
              UniversalFunctions.sendSuccess(
                UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS
                  .DEFAULT,
                response
              )
            );
          });
        });
      }
  }
};

var TrackerRoute = [
    postPageLand,
    getTrackerData
  ];
module.exports = TrackerRoute;