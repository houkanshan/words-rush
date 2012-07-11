var user = require('../controller/user'),
    game = require('../controller/game');

var log = function(req) {
    console.log({
        request : {
            url : req.url,
            data : req.body
        }
    });
}

exports.register = function(req, res) {
    log(req);
    user.register(req, res);
};

exports.login = function(req, res) {
    log(req);
    user.login(req, res);
};

exports.score = function(req, res) {
    log(req);
    user.score(req, res);
};

exports.find = function(req, res) {
    log(req);
    game.find(req, res);
};

exports.create = function(req, res) {
    log(req);
    game.create(req, res);
};

exports.send = function(req, res) {
    log(req);
    game.send(req, res);
};

exports.list = function(req, res) {
    log(req);
    game.list(req, res);
};

exports.question = function(req, res) {
    log(req);
    game.question(req, res);
};

exports.answer = function(req, res) {
    log(req);
    game.answer(req, res);
};

exports.stat = function(req, res) {
    log(req);
    game.stat(req, res);
};
