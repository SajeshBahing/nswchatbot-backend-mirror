"use strict";

var Models = require("../../models");

//Get counselors from DB
var getCounselors = function (criteria, projection, options, callback) {
    if (typeof options !== 'undefined')
        options.lean = true;
    Models.Counselor.find(criteria, projection, options, callback);
};

var updateCounselor = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.Counselor.findOneAndUpdate(criteria, dataToSet, options, callback);
};

var createCounselor = function (objToSave, callback) {
    new Models.Counselor(objToSave).save(callback);
};

var nearestCounselor = function(location, limit, callback) {
    Models.Counselor.aggregate(
        [
            {
                '$geoNear': { 
                    'near': { 'type': "Point", 'coordinates': location},
                    'distanceField': 'dist.distance',
                    'includeLocs': "dist.location",
                    'spherical': true
                }
            },
            { $limit : limit }
        ],
        callback
    );
};

module.exports = {
    findAll: getCounselors,
    update: updateCounselor,
    add: createCounselor,
    nearestCouselor : nearestCounselor
};