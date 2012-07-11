var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var gameSchema = new Schema({
    from : ObjectId,
    to : ObjectId,
    word : String,
    choice : [String],
    correct : Number
});

module.exports = mongoose.model('game', gameSchema);
