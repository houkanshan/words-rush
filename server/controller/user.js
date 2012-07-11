var user = require('../model/user'),
    crypto = require('crypto');

var init = function(res) {
    res.header('Access-Control-Allow-Origin', '*');
}

var hash = function(str) {
    return crypto.createHash('md5').update(str, 'utf-8').digest('hex');
}

exports.register = function(req, res) {
    init(res);
    user.findOne({ email: req.body.email }, function(err, data) {
        if (data) {
            res.send({ error: 1 });
        } else {
            user.findOne({ nickname: req.body.nickname }, function(err, data) {
                if (data) {
                    res.send({ error: 2 });
                } else {
                    var userdata = {
                        nickname : req.body.nickname,
                        email : req.body.email,
                        password : hash(req.body.password),
                        score : 0,
                        word : []
                    }
                    var newuser = new user(userdata);
                    newuser.save();
                    res.send({ loginer: newuser._id });
                }
            });
        }
    });
}

exports.login = function(req, res) {
    init(res);
    user.findOne({ email: req.body.email }, function(err, data) {
        if (data) {
            if (data.password == hash(req.body.password)) {
                res.send({ loginer: data._id });
            } else {
                res.send({ error: true });
            }
        } else {
            res.send({ error: true });
        }
    });
}

exports.score = function(req, res) {
    init(res);
    user.findById(req.body.loginer, function(err, doc) {
        if (doc) {
            res.send({ score : doc.score });
        } else {
        }
    });
}
