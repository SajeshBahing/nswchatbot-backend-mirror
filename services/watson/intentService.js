/**
 * Created by Prashant Solanki on 18/09/2019.
 * Updated all the function to work with Promises as well as callbacks.
 */
"use strict";
import {WatsonIntent} from '../../models';
import {isNullOrUndefined} from '../../utils/universalFunctions'

let updateIntent = (criteria, dataToSet, options, callback) => {
  options.lean = true;
  options.new = true;
  //  get Intent from DB
  // var intentModel = getIntent(criteria)

  //append the new example to the Intent
  const newDataToSet = {};

  if(callback===null)
    return new Promise((resolve, reject) => {
      overwriteIntent(criteria, dataToSet, options, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });

  // use overwriteIntent function
  overwriteIntent(criteria,newDataToSet,options,callback)
};

let overwriteIntent = (criteria, dataToSet, options, callback) => {
  options.lean = true;
  options.new = true;

  if(callback===null)
    return new Promise((resolve, reject) => {
      WatsonIntent.findOneAndUpdate(criteria, dataToSet, options, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });

  WatsonIntent.findOneAndUpdate(criteria, dataToSet, options, function (err,data) {
    if (err) callback(err);
    else callback(null,data);
  });
};

//Insert Intent in DB
let createIntent = (objToSave, callback) => {
  if (callback===null || callback===undefined)
    return new Promise((resolve, reject) => {
      new WatsonIntent(objToSave).save(function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  new WatsonIntent(objToSave).save(callback)
};

//Delete Intent in DB
let deleteIntent = (criteria, callback) => {
  if(callback===null)
    return new Promise((resolve, reject) => {
      WatsonIntent.findOneAndRemove(criteria, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  WatsonIntent.findOneAndRemove(criteria, callback);
};

//Get Intents from DB
let getIntent = (criteria, projection, options, callback) => {
    options.lean = false;

  if(isNullOrUndefined(callback))
    return new Promise((resolve, reject) => {
      WatsonIntent.find(criteria, projection, options, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  WatsonIntent.find(criteria, projection, options, callback);

};

export {
  updateIntent,
  getIntent,
  deleteIntent,
  createIntent,
  overwriteIntent
}
