'use strict';

const AssistV1 = require('ibm-watson/assistant/v1');
const AssistV2 = require('ibm-watson/assistant/v2')

const assistantWorkspaceId = '2125cf90-516d-4bb9-b8a0-39f982b3a7e0'


const assistantV1 = new AssistV1({
  version: '2019-02-28',
  iam_apikey: process.env.ASSISTANT_IAM_APIKEY,
  url: process.env.ASSISTANT_URL
});

const assistantV2 = new AssistV2({
    version: '2019-02-28',
    iam_apikey: process.env.ASSISTANT_IAM_APIKEY,
    url: process.env.ASSISTANT_URL
  })

module.exports = {
    assistantV1: assistantV1,
    assistantV2:assistantV2,
    assistantWorkspaceId: assistantWorkspaceId
};