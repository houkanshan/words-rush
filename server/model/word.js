var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var wordSchema = new Schema({
    spell: String,
    trans: String
});

module.exports = mongoose.model('word', wordSchema);
