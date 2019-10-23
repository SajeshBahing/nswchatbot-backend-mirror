/**
 * Created by Prashant Solanki on 18/09/2019.
 * Updated all the function to work with Promises as well as callbacks.
 */
"use strict";
import {WatsonDialog} from '../../models';
import {isNullOrUndefined} from '../../utils/universalFunctions'

let updateDialog = (criteria, dataToSet, options, callback) => {
  options.lean = true;
  options.new = true;
  //  get Intent from DB
  // var dialogModel = getIntent(criteria)

  //append the new example to the Intent
  const newDataToSet = {};

  if(callback===null)
    return new Promise((resolve, reject) => {
      overwriteDialog(criteria, dataToSet, options, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });

  // use overwriteDialog function
  overwriteDialog(criteria,newDataToSet,options,callback)
};

let overwriteDialog = (criteria, dataToSet, options, callback) => {
  options.lean = true;
  options.new = true;

  if(callback===null)
    return new Promise((resolve, reject) => {
      WatsonDialog.findOneAndUpdate(criteria, dataToSet, options, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });

  WatsonDialog.findOneAndUpdate(criteria, dataToSet, options, function (err,data) {
    if (err) callback(err);
    else callback(null,data);
  });
};

//Insert Dialog in DB
let createDialog = (objToSave, callback) => {
  if (callback===null || callback===undefined)
    return new Promise((resolve, reject) => {
      new WatsonDialog(objToSave).save(function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  new WatsonDialog(objToSave).save(callback)
};

//Delete Dialog in DB
let deleteDialog = (criteria, callback) => {
  if(callback===null)
    return new Promise((resolve, reject) => {
      WatsonDialog.findOneAndRemove(criteria, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  WatsonDialog.findOneAndRemove(criteria, callback);
};

//Get Dialogs from DB
let getDialog = (criteria, projection, options, callback) => {
    options.lean = false;

  if(isNullOrUndefined(callback))
    return new Promise((resolve, reject) => {
      WatsonDialog.find(criteria, projection, options, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  WatsonDialog.find(criteria, projection, options, callback);

};

export {
  updateDialog,
  getDialog,
  deleteDialog,
  createDialog,
  overwriteDialog
}
