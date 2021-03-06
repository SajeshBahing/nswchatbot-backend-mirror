import {isNullOrUndefined} from "../../utils/universalFunctions";
import waterfall from 'async/waterfall';
import Service from "../../services";
import CONFIG from "../../config";
import { difference } from 'underscore'
import {parallel} from "async";

const ERROR = CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;

const assistant = CONFIG.WATSON_CONFIG.assistantV1;

//TODO: Should work
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
    if (op.hasOwnProperty('values')){
      let differ = difference(op.values,data.values);
      data.values.push(differ);
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
  op= {$push: {values: op.values}};
  Service.EntityService.overwriteEntity(q,op,{},callback)
};

const overwriteDb = (op,q,callback) => {
  op= {$set: {values: op.values}};
  Service.EntityService.overwriteEntity(q,op,{},callback)
};

const overwriteWatson = (op,callback) => {
  if (isNullOrUndefined(op)) {
    return callback(ERROR.RESOURCE_NOT_FOUND)
  }

  const updateKeys = (key) => {
    if (op.hasOwnProperty(key)){
      op['new_'+key] = op[key];
      delete op[key];
    }
  };

  let keys = [
    'description',
    'metadata',
    'fuzzy_match',
    'values'
  ];

  for (let k in keys){
    updateKeys(k)
  }

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

let getEntity = (query,callback) => {
  let params = {
    workspace_id: query.workspace_id,
    entity: query.entity,
    _export: query._export,
    include_audit: query.include_audit
  };

  assistant.getEntity(params,callback)
};

let listEntities = (query,callback) =>{
  // let params = {
  //   workspace_id: query.workspace_id,
  //   _export: query._export,
  //   page_limit: query.page_limit,
  //   include_count:query.include_count,
  //   sort:query.sort,
  //   cursor: query.cursor,
  //   include_audit: query.include_audit
  // };

  assistant.listEntities(query,callback);

};

module.exports = {
  createEntity:createEntity,
  updateEntity:updateEntity,
  overwriteEntity:overwriteEntity,
  getEntity: getEntity,
  listEntities: listEntities
};
