/**
 * Created by Navit
 */
'use strict';

import User from './user';
// import {intentModel as WatsonIntent} from './watson/intents'

export{
  User
  // WatsonIntent
}



module.exports = {
    // User:require('./user'),
  ForgetPassword:require('./forgotPasswordRequest'),
  Admin: require('./admin'),
  WatsonIntent: require('./watson/intents'),
  WatsonEntity: require('./watson/entity'),
  WatsonDialog: require('./watson/dialog'),
  Counselor: require('./maps/counselors'),
  Appointment: require('./appointment'),
  Tracker: require('./tracker')
};

