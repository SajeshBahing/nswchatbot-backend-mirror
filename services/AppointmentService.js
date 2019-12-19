"use strict";

var Models = require("../models");

var createAppointment = function (objToSave, callback) {
    new Models.Appointment(objToSave).save(callback);
};

module.exports = {
    add: createAppointment
};