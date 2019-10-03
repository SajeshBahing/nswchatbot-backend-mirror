/**
 * Created by Prashant Solanki on 18/09/2019.
 * Updated all the function to work with Promises as well as callbacks.
 */
"use strict";
import {WatsonEntity} from '../../models';
import {isNullOrUndefined} from '../../utils/universalFunctions'

let updateEntity = (criteria, dataToSet, options, callback) => {
  options.lean = true;
  options.new = true;
  //  get Entity from DB
  // var entityModel = getEntity(criteria)

  //append the new example to the Entity
  const newDataToSet = {};

  if(callback===null)
    return new Promise((resolve, reject) => {
      overwriteEntity(criteria, dataToSet, options, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });

  // use overwriteEntity function
  overwriteEntity(criteria,newDataToSet,options,callback)
};

let overwriteEntity = (criteria, dataToSet, options, callback) => {
  options.lean = true;
  options.new = true;

  if(callback===null)
    return new Promise((resolve, reject) => {
      WatsonEntity.findOneAndUpdate(criteria, dataToSet, options, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });

  WatsonEntity.findOneAndUpdate(criteria, dataToSet, options, function (err,data) {
    if (err) callback(err);
    else callback(null,data);
  });
};

//Insert Entity in DB
let createEntity = (objToSave, callback) => {
  if (callback===null || callback===undefined)
    return new Promise((resolve, reject) => {
      new WatsonEntity(objToSave).save(function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  new WatsonEntity(objToSave).save(callback)
};

//Delete Entity in DB
let deleteEntity = (criteria, callback) => {
  if(callback===null)
    return new Promise((resolve, reject) => {
      WatsonEntity.findOneAndRemove(criteria, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  WatsonEntity.findOneAndRemove(criteria, callback);
};

//Get Entities from DB
let getEntity = (criteria, projection, options, callback) => {
    options.lean = false;

  if(isNullOrUndefined(callback))
    return new Promise((resolve, reject) => {
      WatsonEntity.find(criteria, projection, options, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });
  WatsonEntity.find(criteria, projection, options, callback);

};

export {
  updateEntity,
  getEntity,
  deleteEntity,
  createEntity,
  overwriteEntity
}
