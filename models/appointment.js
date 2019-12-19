let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let appointment = new Schema({
    user_id: { type: String, trim: true, required: true },
    username: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },
    counselor: { type: String, trim: true, required: true },
    date: {type: Date, required: true},
});

module.exports = mongoose.model("appointment", appointment);

