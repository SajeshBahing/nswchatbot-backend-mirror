'use strict';

const uuid = require('uuid/v1');

export function setSession(bot, user_id)
{
    let uniqueSessionID = uuid();
    
    bot.controller.adapter.getConnection(user_id)['session_id'] = uniqueSessionID;

    return uniqueSessionID; 
}

export function getSession(bot, user_id)
{
    return bot.controller.adapter.getConnection(user_id)['session_id'];
}

export function setSessionData(bot, user_id, key, value)
{
    bot.controller.adapter.getConnection(user_id)[key] = value;
}

export function getSessionData(bot, user_id, key)
{
    return bot.controller.adapter.getConnection(user_id)[key];
}