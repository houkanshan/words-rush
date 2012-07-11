var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var pairSchema = new Schema({
    user_1 : ObjectId,
    user_2 : ObjectId,
    date : { type: Date, default: Date.now }
});

module.exports = mongoose.model('pair', pairSchema);
