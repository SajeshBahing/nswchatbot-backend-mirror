/**
 * Created by Navit
 */
import UniversalFunctions from "../../utils/universalFunctions";
import waterfall from 'async/waterfall';
import Service from "../../services";
// import {getIntent} from "../../services/watson/intentService"
import CONFIG from "../../config";
import { difference } from 'underscore'

const {APP_CONSTANTS} = UniversalFunctions.CONFIG;

const ERROR = APP_CONSTANTS.STATUS_MSG.ERROR;

const assistant = CONFIG.WATSON_CONFIG.assistantV1;

export let sendMessage = (message, callback) => {
  assistant.message({
    workspace_id: CONFIG.WATSON_CONFIG.assistantWorkspaceId,
    input: {'text': message.message}
  })
    .then(res => {
      return callback(null, res)
    })
    .catch(err => {
      return callback(err, null)
    })
};

export let listWorkspaces = callback => {
  assistant.listWorkspaces()
    .then(res => {
      return callback(null, res)
    })
    .catch(err => {
      return callback(err, null)
    });
};

export let createIntent = (intent, callback) => {
  const createIntentInDb = (callback) => {

    let cb = function (sh, se) {
      if (sh) return callback(sh, null);
      else return callback(null, se);
    };

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

export let updateIntent = (data, callback) => {
  let intent = data;
  // intentModel.new_examples = intentModel.examples;
  // delete data.examples;
  let q = {workplace_id: data.workplace_id,
  intent: data.intent};

  const updateIntentContent = (op,cb) => {
    // Service.IntentService.getIntent(q,null,null)
    // .then(res => {return callback(null,res);})
    // .catch(err => {return callback(err, null);})
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

  const overwriteDb = (op,callback) => {
    op= {$push: {examples: op.examples}};
    Service.IntentService.overwriteIntent(q,op,{},callback)
      // .then(res => {return callback(null,res)})
      // .catch(err => {return callback(err)})
    };

  const overwriteWatson = (op,callback) => {
    intent.new_examples = op.examples;
    delete intent.examples;
    assistant.updateIntent(intent,callback)
      // .then(res => { return callback(null,res);})
      // .catch(err => { return callback(err,null);});
  };


  let waterfall_func_list = [function (callback) {
    getFromDb(q,callback)
  },
    updateIntentContent,
    overwriteDb,
    overwriteWatson];

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

export let overwriteIntent = (data,callback) => {
  let intent = data;
  // intentModel.new_examples = intentModel.examples;
  // delete data.examples;
  let q = {workplace_id: data.workplace_id,
    intent: data.intent};

  const overwriteDb = (callback) => {
    Service.IntentService.overwriteIntent(q,intent,null)
      .then(res => {return callback(null,res)})
      .catch(err => {return callback(err)})
  };

  const overwriteWatson = (op,callback) => {
    //TODO add checks here.
    console.log(op);

    intent.new_examples = intent.examples;
    delete intent.examples;

    assistant.updateIntent(intent)
      .then(res => { return callback(null,res);})
      .catch(err => { return callback(err,null);});
  };


  let waterfall_func_list = [overwriteDb, overwriteWatson];

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
  listWorkspaces: listWorkspaces,
  sendMessage:sendMessage,
  createIntent:createIntent,
  updateIntent:updateIntent,
  overwriteIntent:overwriteIntent
};
