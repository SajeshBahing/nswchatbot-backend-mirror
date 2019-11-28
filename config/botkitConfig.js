import { WatsonMiddleware } from 'botkit-middleware-watson';
import { MemoryStorage } from 'botbuilder';

const { Botkit } = require('botkit');
const WatsonConfig = require('./watsonConfig');
const WebAdapter = require('botbuilder-adapter-web').WebAdapter;
const adapter = new WebAdapter({});

const botkit = new Botkit({
  adapter:adapter,
  webhook_uri: "/api/messages",
  storage : new MemoryStorage()
});

botkit.webserver.use((request, response) => {
  console.log(request);
});

const watsonMiddleware = new WatsonMiddleware({
  iam_apikey: process.env.ASSISTANT_IAM_APIKEY,
  url: process.env.ASSISTANT_URL,
  workspace_id: WatsonConfig.assistantWorkspaceId,
  version: '2019-02-28',
  minimum_confidence: 0.75, // (Optional) Default is 0.75,
});

botkit.middleware.receive.use(
  watsonMiddleware.receive.bind(watsonMiddleware),
);

module.exports = {
  botkit: botkit,
  watsonMiddleware: watsonMiddleware,
  adapter: adapter,
};