'use strict';
var s3BucketCredentials = {
    "bucket": "samplebucketname",
    "accessKeyId": "accesskeyId",
    "secretAccessKey": "secretkey",
    "s3URL": "http://bucketname.s3.amazonaws.com",
    "folder": {
        "profilePicture": "profilePicture",
        "thumb": "thumb",
        "customer":"customer"
    },
    "agentDefaultPicUrl": "http://instamow.s3.amazonaws.com/agent/profilePicture/default.png",
    "fbUrl": "https://graph.facebook.com/"
};

// const AssistantV1 = require('ibm-watson/assistant/v1');

// const assistant = new AssistantV1({
//   version: '2019-02-28',
//   iam_apikey: process.env.ASSISTANT_IAM_APIKEY,
//   url: process.env.ASSISTANT_URL
// });
module.exports = {
    s3BucketCredentials: s3BucketCredentials,
    // assistant: assistant
};
