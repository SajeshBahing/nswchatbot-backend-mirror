import CONFIG from "../../config";

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

module.exports = {
  listWorkspaces: listWorkspaces,
  sendMessage: sendMessage
};
