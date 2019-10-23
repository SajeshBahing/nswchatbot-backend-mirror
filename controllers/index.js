/**
 * Created by Navit
 */
"use strict";



import demoController from './demoController/demoBaseController';

import userController from './userController/userBaseController';

import adminController from './adminController/adminBaseController';

import watsonIntentController from './watsonController/watsonIntentController';

import watsonEntityController from './watsonController/watsonEntityController';

import watsonDialogController from './watsonController/watsonDialogController';

module.exports = {
  DemoBaseController: demoController,
  UserBaseController: userController,
  AdminBaseController: adminController,
  WatsonIntentController: watsonIntentController,
  WatsonEntityController: watsonEntityController,
  WatsonDialogController: watsonDialogController
};
