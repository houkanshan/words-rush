var exports = window;
var $ = Zepto;

// TODO: remove
if (typeof Object.create !== 'function') {
    Object.create = function(o) {
        function F() {};
        F.prototype = o;
        return new F();
    };
}

var Games = {
    record: {},
    compiledTplList: null,
    curGameId: - 1,

    initialize: function() {
        this.compiledTplItem = juicer($('#tpl-game-item').html());
    },
    add: function(game) {
        game.parent = this;
        game.destroy = function() {
            this.view.remove();
            return delete this.parent.record[game.id];
        };
        game.render = function() {
            var html = this.parent.compiledTplItem.render({
                item: this
            });
            var gamesListEl = $('#games-list').find('.list');
            if (!this.view) {
                this.view = $('<li>')
                this.view.append(html);
                this.view.prependTo(gamesListEl);
            }
            else {
                this.view.html(html);
            }
        };
        game.update = function() {
            //this.id = gameNew.id;
            //this.nickname = gameNew.nickname;
            //this.newWord = gameNew.newWord;
            App.sendReq('stat', {
                loginer: localStorage.loginer,
                pair: this.id
            },
            $.proxy(function(res) {
                var statStr = ['Ask', 'Answer', 'Waiting'];
                var statClass = ['stat-ask', 'stat-answer', 'stat-wait']
                this.stateStr = statStr[res.stat];
                this.stateClass = statClass[res.stat];
                this.change();
            },
            this));
        };
        game.change = function() {
            game.changeTime = Date.now();
            game.render();
        };

        this.record[game.id] = game;
        game.update();
        game.change();
    },
    find: function(id) {
        return this.record[id];
    },
    removeAll: function() {
        for (var key in this.record) {
            this.record[key].destroy();
        }
        this.record = {};
    },
    update: function() {
        var gamesListEl = $('#games-list').find('.list');
        if (gamesListEl.length === 0) {
            return;
        }
        //var gameListItemsEl = gameListEl.find('.item');
        App.sendReq('list', {
            loginer: localStorage.loginer
        },
        $.proxy(function(res) {
            console.log(res);
            this.removeAll();
            for (var i = 0; i < res.pair.length; i++) {
                this.add(res.pair[i]);
            }
        },
        this));
    }
};

var App = {
    route: null,
    dialog: null,
    tpls: {},
    host: 'http://199.71.212.225:3000',
    timer: null,

    /* base function */
    initialize: function() {
        this.route = exports.Route;
        this.dialog = exports.Dialog;
        //get views
        this.tpls = {
            'createGame': $('#tpl-createGame').html(),
            'gamesList': $('#tpl-games-list').html(),
            'dialog:createGame': $('#tpl-dialog-creategame').html(),
            'dialog:searchByEmail': $('#tpl-dialog-searchemail').html(),
            'dialog:searchByName': $('#tpl-dialog-searchname').html(),
            'dialog:searchResult': $('#tpl-dialog-searchresult').html()
        };

        Games.initialize();
        this.route.initialize(this.host);
        this.dialog.initialize();
        this.defaultEvent();
    },
    run: function() {
        if (localStorage.loginer) {
            this.route.switchTo('main', {});
        } else {
            this.route.switchTo('login', {});
        }

        if (this.route.curView !== 'main') {
            return;
        }
        this.startFlash();
        localStorage.wronglist = JSON.stringify([]);

    },
    startFlash: function(){
        Games.update();
        this.timer = setInterval($.proxy(function() {
            if (this.route.curView !== 'main') {
                return;
            }
            Games.update();
        },
        this), 1000 * 5);
    },
    defaultEvent: function() {
        $homeBtn = $('.home');
        $homeBtn.on('click', $.proxy(function() {
            this.route.changeTo('main', {});
        },
        this));
    },

    /* dialog function */
    sendReq: function(method, data, callback) {
        console.log('send', data);
        $.ajax({
            type: 'post',
            url: this.host + '/' + method,
            dataType: 'json',
            data: data,
            success: function(res) {
                console.log(res);
                if (res.error) {
                    console.log('[err]' + method);
                }
                var func = $.proxy(callback, this);
                func(res);
            }
        });
    },
    searchFor: function(opt, callback) {
        this.sendReq('find', opt, callback);
    },
    createGame: function(pairId, callback) {
        this.sendReq('create', {
            loginer: localStorage.loginer,
            pair: pairId
        },
        callback);
    },
    searchByEmail: function() {
        this.dialog.popout($.proxy(function() {
            this.dialog.popin(this.tpls['dialog:searchByEmail'], {
                'click .dialog-search': function() {
                    var $email = this.dialog.$overlayBox.find('.input');
                    //alert($email.val());
                    //TODO 放搜索代码, 这里的this就是是App
                    this.searchFor({
                        type: 1,
                        find: $email.val(),
                        loginer: localStorage.loginer
                    },
                    $.proxy(function(data) {
                        console.log('[info]find:', data);

                        this.searchResult(data.find);

                    },
                    this));
                }
            });
        },
        this));
    },
    searchByName: function() {
        this.dialog.popout($.proxy(function() {
            this.dialog.popin(this.tpls['dialog:searchByName'], {
                'click .dialog-search': function() {
                    var $name = this.dialog.$overlayBox.find('.input');
                    //alert($name.val());
                    //TODO 放搜索代码
                    this.searchFor({
                        type: 2,
                        find: $name.val(),
                        loginer: localStorage.loginer
                    },
                    $.proxy(function(data) {
                        console.log('[info]find:', data);

                        this.searchResult(data.find);

                    },
                    this));
                }
            });
        },
        this));
    },
    searchRandom: function() {

        this.searchFor({
            type: 3,
            find: '',
            loginer: localStorage.loginer
        },
        $.proxy(function(data) {
            console.log('[info]find:', data);

            this.searchResult(data.find);

        },
        this));
    },
    searchResult: function(res) {
        this.dialog.popout($.proxy(function() {
            var html = juicer(this.tpls['dialog:searchResult'], res);
            this.dialog.popin(html, {
                'tap .search-list-item': function(e) {
                    var $item = $(e.target);
                    //alert($item.data('id'));
                    //TODO:加创建游戏代码
                    this.createGame($item.data('id'), $.proxy(function(data) {
                        //TODO: startGame, request for quesiton
                        Games.curGameId = $item.data('id');
                        this.dialog.popout();
                        this.route.switchTo('question', {});
                    },
                    this));
                }
            });
        },
        this));
    },
    sendQuestion: function() {}
};

Zepto(document).ready(function($) {
    App.initialize();
    App.run();
});

