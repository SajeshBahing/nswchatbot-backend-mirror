/**
 * Created by Navit on 1/20/16.
 */
module.exports = {
  UserService: require("./userService"),
  ForgetPasswordService: require("./forgetPasswordService"),
  AdminService: require("./adminService"),
  IntentService: require("./watson/intentService"),
  EntityService: require("./watson/entityService"),
  DialogService: require("./watson/dialogService"),
  CounselorService: require("./maps/CounselorService")
};
