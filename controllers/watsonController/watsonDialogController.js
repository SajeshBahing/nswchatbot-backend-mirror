import {isNullOrUndefined} from "../../utils/universalFunctions";
import waterfall from 'async/waterfall';
import Service from "../../services";
import CONFIG from "../../config";
import { difference } from 'underscore'
import {parallel} from "async";

const ERROR = CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;

const assistant = CONFIG.WATSON_CONFIG.assistantV1;

//TODO: Should work
let createDialog = (dialog, callback) => {
  const createDialogInDb = (callback) => {
    Service.DialogService.createDialog(dialog)
      .then(res => { return callback(null,res) })
      .catch(err =>{ return callback(err, null)});
  };

  const createDialogInWatson = (data, callback) => {
    assistant.createDialogNode(dialog)
      .then(res => { return callback(null, res); })
      .catch(err => { return callback(err, null); });
  };

  if (callback===null) {
    return new Promise((resolve,reject) => {
      waterfall([createDialogInDb, createDialogInWatson], (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  };

  waterfall([createDialogInDb, createDialogInWatson], (err, data) => {
    if (err) callback(err,null);
    else callback(null,data);
  });
};

const getFromDb = (q,callback) => {
  Service.DialogService.getDialog(q,{},{},callback)
};

const updateDialogContent = (op,data,cb) => {
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
  Service.DialogService.overwriteDialog(q,op,{},callback)
};

const overwriteDb = (op,q,callback) => {
  op= {$set: {values: op.values}};
  Service.DialogService.overwriteDialog(q,op,{},callback)
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

  assistant.updateDialogNode(op,callback)
};

let updateDialog = (data, callback) => {
  let q = {workplace_id: data.workplace_id,
  dialog: data.dialog};

  let waterfall_func_list = [
    (callback) => {getFromDb(q,callback)},
    (op,callback) => {updateDialogContent(op,data,callback)},
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

let overwriteDialog = (data,callback) => {
  let dialog = data;
  let q = {workplace_id: data.workplace_id,
    dialog: data.dialog};

  let waterfall_func_list = [(callback)=>{overwriteDb(dialog,q,callback)},
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

let getDialog = (query,callback) => {
  let params = {
    workspace_id: query.workspace_id,
    dialog: query.dialog,
    _export: query._export,
    include_audit: query.include_audit
  };

  assistant.getDialogNode(params,callback)
};

let listDialogs = (query,callback) =>{
  // let params = {
  //   workspace_id: query.workspace_id,
  //   _export: query._export,
  //   page_limit: query.page_limit,
  //   include_count:query.include_count,
  //   sort:query.sort,
  //   cursor: query.cursor,
  //   include_audit: query.include_audit
  // };

  assistant.listDialogNodes(query,callback);
};

module.exports = {
  createDialog:createDialog,
  updateDialog:updateDialog,
  overwriteDialog:overwriteDialog,
  getDialog: getDialog,
  listDialog: listDialogs
};
