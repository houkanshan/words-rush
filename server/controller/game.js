var user = require('../model/user'),
    game = require('../model/game'),
    pair = require('../model/pair'),
    word = require('../model/word');

var ObjectId = require('mongoose').Types.ObjectId;

//添加ajax跨域允许
var init = function(res) {
    res.header('Access-Control-Allow-Origin', '*');
}

//当前游戏（配对）列表
exports.list = function(req, res) {
    init(res);
    var id = ObjectId(req.body.loginer);
    pair.find({ $or : [ { user_1 : id }, { user_2 : id } ] }, function(err, doc) {
        if (doc.length) {
            //获取所有配对
            var list = [];
            for (var i = 0; i < doc.length; i++) {
                list.push((doc[i].user_1 == req.body.loginer) ? doc[i].user_2 : doc[i].user_1);
            }
            user.find({ _id : { $in : list } }, function(err, doc) {
                //获取所有配对玩家的信息
                var results = [];
                for (var i = 0; i < doc.length; i++) {
                    results.push({
                        id : doc[i]._id,
                        nickname : doc[i].nickname,
                        newWord : false
                    });
                }
                res.send({ pair : results });
            });
        } else {
        }
    });
}

//获取当前游戏状态，0：等待我出题，1：等待我回答，2：等待对方回答
exports.stat = function(req, res) {
    init(res);
    game.findOne({ to : ObjectId(req.body.loginer), from : ObjectId(req.body.pair) }, function(err, doc) {
        if (doc) {
            res.send({ stat : 1 });
        } else {
            game.findOne({ to : ObjectId(req.body.pair), from : ObjectId(req.body.loginer) }, function(err, doc) {
                if (doc) {
                    res.send({ stat : 2 });
                } else {
                    res.send({ stat : 0 });
                }
            });
        }
    });
}

//获得问题
exports.question = function(req, res) {
    init(res);
    var from = req.body.from,
        to = req.body.loginer;
    game.findOne({ from : from, to : to }, function(err, doc) {
        if (doc) {
            res.send({
                id : doc._id,
                word : doc.word,
                choice : doc.choice
            });
        } else {
            res.send({ error : true });
        }
    });
}

//回答问题
exports.answer = function(req, res) {
    init(res);
    var id = req.body.id,
        choice = req.body.choice;
    game.findById(id, function(err, doc) {
        if (doc) {
            if (choice == doc.correct) {
                var id = req.body.loginer;
                user.findById(id, function(err, doc) {
                    if (doc) {
                        doc.score += 10;
                        doc.save();
                    } else {
                    }
                });
                res.send({ correct : true });
            } else {
                res.send({ correct : false });
            }
            doc.remove();
        } else {
            res.send({ error : true });
        }
    });
}

//寻找玩家
exports.find = function(req, res) {
    init(res);
    var type = req.body.type,
        loginer = req.body.loginer;
    switch (+type) {
        //通过email寻找
        case 1:
            var find = req.body.find;
            user.findOne({ email : find, _id : { $ne : ObjectId(loginer) } }, function(err, doc) {
                if (doc) {
                    //返回结果
                    res.send({
                        error: false,
                        find: {
                            id: doc._id,
                            nickname: doc.nickname
                        }
                    });
                } else {
                    res.send({ error: true });
                }
            });
            break;
        //通过昵称寻找
        case 2:
            var find = req.body.find;
            user.findOne({ nickname: find, _id : { $ne : ObjectId(loginer) } }, function(err, doc) {
                if (doc) {
                    //返回结果
                    res.send({
                        error: false,
                        find: {
                            id: doc._id,
                            nickname: doc.nickname
                        }
                    });
                } else {
                    res.send({ error: true });
                }
            });
            break;
        //随机查找
        case 3:
            user.count({}, function(err, count) {
                var index = Math.floor(Math.random() * count);
                user.find({ _id : { $ne : ObjectId(loginer) } }).skip(index).limit(1).exec(function(err, doc) {
                    if (doc) {
                        //返回结果
                        res.send({
                            error: false,
                            find: {
                                id: doc._id,
                                nickname: doc.nickname
                            }
                        });
                    } else {
                        res.send({ error: true });
                    }
                });
            });
            break;
    }
}

//创建配对
exports.create = function(req, res) {
    init(res);
    //保存配对信息
    var pairData = {
        user_1 : ObjectId(req.body.loginer),
        user_2 : ObjectId(req.body.pair)
    }
    var newPair = new pair(pairData);
    newPair.save();
    res.send({ error: false });
}

//发送一个题目
exports.send = function(req, res) {
    init(res);
    word.findOne({ spell : req.body.word }, function(err, doc) {
        if (doc) {
            req.body.trans = doc.trans;
            word.find({ spell : { $ne : req.body.word } }, function(err, doc) {
                //保存游戏信息
                var gameData = {
                    from : ObjectId(req.body.from),
                    to : ObjectId(req.body.to),
                    word : req.body.word,
                    choice : [],
                    correct : Math.floor(Math.random() * 4)
                }
                //随机产生错误选项
                for (var i = 0; i < 3; i++) {
                    var index = Math.floor(Math.random() * doc.length);
                    var trans = doc[index].trans;
                    gameData.choice.push(trans);
                }
                //插入正确答案
                gameData.choice.splice(gameData.correct, 0, req.body.trans);
                var newGame = new game(gameData);
                newGame.save();
                res.send({ error : false });
            });
        } else {
            res.send({ error : true });
        }
    });
}
