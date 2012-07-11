var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    nickname : String,
    email : String,
    password : String,
    score : Number,
    word : [String]
});

module.exports = mongoose.model('user', userSchema);
