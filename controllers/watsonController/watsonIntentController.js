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

//TODO: Revert mongoDb insert if Watson throws an error.
let createIntent = (intent, callback) => {
  const createIntentInDb = (callback) => {
    Service.IntentService.createIntent(intent)
      .then(res => { return callback(null,res) })
      .catch(err =>{ return callback(err, null)});
  };

  const createIntentInWatson = (data, callback) => {
    assistant.createIntent(intent)
      .then(res => { return callback(null, res); })
      .catch(err => { return callback(err, null); });
  };

  if (callback===null) {
    return new Promise((resolve,reject) => {
      waterfall([createIntentInDb, createIntentInWatson], (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  waterfall([createIntentInDb, createIntentInWatson], (err, data) => {
    if (err) callback(err,null);
    else callback(null,data);
  });
};

const getFromDb = (q,callback) => {
  Service.IntentService.getIntent(q,{},{},callback)
};

const updateIntentContent = (op,data,cb) => {
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
  Service.IntentService.overwriteIntent(q,op,{},callback)
};

const overwriteDb = (op,q,callback) => {
  op= {$set: {examples: op.examples}};
  Service.IntentService.overwriteIntent(q,op,{},callback)
};

const overwriteWatson = (op,callback) => {
  if (isNullOrUndefined(op)) {
    return callback(ERROR.RESOURCE_NOT_FOUND)
  }
  op.new_examples = op.examples;
  delete op.examples;
  assistant.updateIntent(op,callback)
};

let updateIntent = (data, callback) => {
  let q = {workplace_id: data.workplace_id,
  intent: data.intent};

  let waterfall_func_list = [
    (callback) => {getFromDb(q,callback)},
    (op,callback) => {updateIntentContent(op,data,callback)},
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

let overwriteIntent = (data,callback) => {
  let intent = data;
  let q = {workplace_id: data.workplace_id,
    intent: data.intent};

  let waterfall_func_list = [(callback)=>{overwriteDb(intent,q,callback)},
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

let listIntents = (query,callback) =>{
  // let params = {
  //   workspace_id: query.workspace_id,
  //   _export: query._export,
  //   page_limit: query.page_limit,
  //   include_count:query.include_count,
  //   sort:query.sort,
  //   cursor: query.cursor,
  //   include_audit: query.include_audit
  // };
  assistant.listIntents(query,callback);
};

let getIntent = (query,callback) =>{
  assistant.getIntent(query,callback);
};

module.exports = {
  createIntent:createIntent,
  updateIntent:updateIntent,
  overwriteIntent:overwriteIntent,
  listIntents:listIntents,
  getIntent:getIntent
};
