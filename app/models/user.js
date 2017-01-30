// app/models/user.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    birthDate: Date,
    gender: String,
    token: String
});

module.exports = mongoose.model("User", UserSchema);
