let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const pointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

let counselor = new Schema({
    postcode: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    address: { type: String, trim: true, required: true },
    service_area: { type: String, trim: true, required: true },
    location: { type: pointSchema, required: true }
});

module.exports = mongoose.model("counselors", counselor);

