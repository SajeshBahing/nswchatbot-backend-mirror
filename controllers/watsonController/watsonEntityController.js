/**
 * Created by Navit
 */
import {isNullOrUndefined} from "../../utils/universalFunctions";
import waterfall from 'async/waterfall';
import Service from "../../services";
import CONFIG from "../../config";
import { difference } from 'underscore'

const ERROR = CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;

const assistant = CONFIG.WATSON_CONFIG.assistantV1;

let createEntity = (entity, callback) => {
  const createEntityInDb = (callback) => {
    Service.EntityService.createEntity(entity)
      .then(res => { return callback(null,res) })
      .catch(err =>{ return callback(err, null)});
  };

  const createEntityInWatson = (data, callback) => {
    assistant.createEntity(entity)
      .then(res => { return callback(null, res); })
      .catch(err => { return callback(err, null); });
  };

  if (callback===null) {
    return new Promise((resolve,reject) => {
      waterfall([createEntityInDb, createEntityInWatson], (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  waterfall([createEntityInDb, createEntityInWatson], (err, data) => {
    if (err) callback(err,null);
    else callback(null,data);
  });
};

const getFromDb = (q,callback) => {
  Service.EntityService.getEntity(q,{},{},callback)
};

const updateEntityContent = (op,data,cb) => {
  try{
    op = JSON.stringify(op);
    if (op.hasOwnProperty('examples')){
      let differ = difference(op.examples,data.examples);
      data.examples.push(differ);
      console.log(data)
    }else{
      console.log(op)
    }
    cb(null,data)
  }catch(err){
    console.log(err);
    cb(err,null)
  }
};

const updateDb = (op,q,callback) => {
  op= {$push: {examples: op.examples}};
  Service.EntityService.overwriteEntity(q,op,{},callback)
};

const overwriteDb = (op,q,callback) => {
  op= {$set: {examples: op.examples}};
  Service.EntityService.overwriteEntity(q,op,{},callback)
};

const overwriteWatson = (op,callback) => {
  if (isNullOrUndefined(op)) {
    return callback(ERROR.RESOURCE_NOT_FOUND)
  }
  op.new_examples = op.examples;
  delete op.examples;
  assistant.updateEntity(op,callback)
};

let updateEntity = (data, callback) => {
  let q = {workplace_id: data.workplace_id,
  entity: data.entity};

  let waterfall_func_list = [
    (callback) => {getFromDb(q,callback)},
    (op,callback) => {updateEntityContent(op,data,callback)},
    (op,callback)=>{updateDb(op,q,callback)},
    (op,callback) => {overwriteWatson(op,callback)}];

  if (callback===null) {
    return new Promise((resolve,reject) => {
      waterfall(waterfall_func_list, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  waterfall(waterfall_func_list, (err, data) => {
    if (err) callback(err,null);
    else callback(null,data);
  });
};

let overwriteEntity = (data,callback) => {
  let entity = data;
  let q = {workplace_id: data.workplace_id,
    entity: data.entity};

  let waterfall_func_list = [(callback)=>{overwriteDb(entity,q,callback)},
    (op,callback) => {overwriteWatson(op,callback)}];

  if (callback===null) {
    return new Promise((resolve,reject) => {
      waterfall(waterfall_func_list, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  waterfall(waterfall_func_list, (err, data) => {
    if (err) callback(err,null);
    else callback(null,data);
  });
};
module.exports = {
  createEntity:createEntity,
  updateEntity:updateEntity,
  overwriteEntity:overwriteEntity
};
