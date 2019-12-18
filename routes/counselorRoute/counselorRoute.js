import Config from '../../config';
import UniversalFunctions from "../../utils/universalFunctions";
import Joi from "joi";
import Controller from "../../controllers";

const baseEndpointURL = '/api/counselor/';

const getCounselorTimeSheet = {
    method: "GET",
    path: baseEndpointURL + "timesheet/list",
    config: {
        description: "Get timesheet of specific counselor",
        tags: ["api", "demo", 'get'],
        handler: async function (request, h) {
            return await Controller.cousnselorAPIController.timeSheet();
        },
        validate: {
          failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            "hapi-swagger": {
                responseMessages:
                    UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

var CounselorRoute = [
    getCounselorTimeSheet
  ];
  module.exports = CounselorRoute;