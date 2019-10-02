/**
 * Created by Prashant Solanki on 18/09/2019.
 * Updated all the function to work with Promises as well as callbacks.
 */
"use strict";
// import  from '../../models';
const Models= require('../../models');
import {isNull, isUndefined} from 'underscore'
// var Models = require("../../models");
// const WatsonIntent = intentModel;

const isNullOrUndefined = thing => {
  return isNull(thing)||isUndefined(thing)
};

export let updateIntent = (criteria, dataToSet, options, callback) => {
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

export let overwriteIntent = (criteria, dataToSet, options, callback) => {
  options.lean = true;
  options.new = true;

  if(callback===null)
    return new Promise((resolve, reject) => {
      WatsonIntent.findOneAndUpdate(criteria, dataToSet, options, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });

  Models.WatsonIntent.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Intent in DB
export let createIntent = (objToSave, callback) => {
  if (callback===null || callback===undefined)
    return new Promise((resolve, reject) => {
      new WatsonIntent(objToSave).save(function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  let temp = new WatsonIntent(objToSave);
  temp.save(callback)
  // console.log("adkdjankdcy")
};

//Delete Intent in DB
export let deleteIntent = (criteria, callback) => {
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
export let getIntent = (criteria, projection, options, callback) => {
    options.lean = false;

  if(isNullOrUndefined(callback))
    return new Promise((resolve, reject) => {
      Models.WatsonIntent.find(criteria, projection, options, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  Models.WatsonIntent.find(criteria, projection, options, callback);

};
