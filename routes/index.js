/**
 * Created by Navit
 */
"use strict";

import IntentBaseRoute from "./watsonRoute/intentRoute";
import DemoBaseRoute from "./demoRoute/demoBaseRoute";
import UserBaseRoute from "./userRoute/userBaseRoute";
import AdminBaseRoute from "./adminRoute/adminBaseRoute";
import WatsonBaseRoute from "./watsonRoute/watsonDemoRoute";

let APIs = [].concat(DemoBaseRoute, UserBaseRoute, AdminBaseRoute, WatsonBaseRoute, IntentBaseRoute);
module.exports = APIs;
