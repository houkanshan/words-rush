(function($, exports) {
    var Route = {
        host: '',
        tpls: {},
        curView: '',
        initialize: function(host) {
            this.tpls = {
                'main': $('#tpl-main').html(),
                'login': $('#tpl-login').html(),
                'signin': $('#tpl-signin').html(),
                'answer': $('#tpl-answer').html(),
                'createGame': $('#tpl-createGame').html(),
                'question': $('#tpl-question').html(),
                'wronglist': $('#tpl-wronglist').html()
            };
            this.host = host;
        },
        hashChange: function(event) {

        },
        initEvent: function(viewName) {
            var that = this;
            switch (viewName) {
            case 'signin':
                $('.signin').on('tap', function() {
                    console.log('tap sigin');
                    var email = $('.signin-email').val(),
                    nickname = $('.signin-nick').val(),
                    password = $('.signin-pass').val();
                    $.ajax({
                        type: 'post',
                        url: that.host + '/register',
                        dataType: 'json',
                        data: {
                            email: email,
                            nickname: nickname,
                            password: password
                        },
                        success: function(data) {
                            if (data.error) {
                                switch (data.error) {
                                case 1:
                                    alert('邮箱已存在');
                                    break;
                                case 2:
                                    alert('昵称已存在');
                                    break;
                                }
                            } else {
                                localStorage.loginer = data.loginer;
                                that.switchTo('main', {});
                            }
                        }
                    });
                    return false;
                });
                break;
            case 'login':
                $('.signin').on('tap', function() {
                    that.switchTo('signin', {});
                    return false;
                });
                $('.login').on('tap', function() {
                    var email = $('.login-email').val(),
                    password = $('.login-pass').val();

                    $.ajax({
                        type: 'post',
                        url: that.host + '/login',
                        dataType: 'json',
                        data: {
                            email: email,
                            password: password
                        },
                        success: function(data) {
                            if (data.error) {
                                alert('用户名或密码错误');
                            } else {
                                localStorage.loginer = data.loginer;
                                that.switchTo('main', {});
                            }
                        }
                    });
                    return false;
                });
                break;
            case 'main':
                Games.update();
                localStorage.wronglist = JSON.stringify([]);
                $('.games-create').on('tap', function(e) {
                    Dialog.popin($('#tpl-dialog-creategame').html(), {
                        'tap .by-email': App['searchByEmail'],
                        'tap .by-name': App['searchByName'],
                        'tap .by-random': App['searchRandom']
                    });
                    e.stopPropagation();
                    e.cancelBubble = true;
                });
                $('.games-logout').on('tap', function(){
                    localStorage.clear();
                    that.switchTo('login');
                });
                $('.games-wronglist').on('tap', function() {
                    App.sendReq('score', {
                        loginer: localStorage.loginer
                    }, function(res){
                        that.switchTo('wronglist', {
                            score: res.score, 
                            words: JSON.parse(localStorage.wronglist)
                        });
                    });
                    that.switchTo('wronglist', {});
                });
                $('#games-list').delegate('.game-item', 'tap', function(e) {
                    //TODO: 切换到answer并渲染
                    var gameId = $(this).data('id');
                    Games.curGameId = gameId;
                    switch (Games.find(gameId).stateClass){
                        case 'stat-ask': 
                            that.switchTo('question', {});
                            break;
                        case 'stat-answer':
                            App.sendReq('question', {
                                loginer: localStorage.loginer, 
                                from: Games.curGameId
                            }, function(res){
                                that.switchTo('answer', res);
                            });
                            break;
                        default: break;
                    }
                    return false;
                });
                break;
            case 'question':
                $('.question-ask').on('tap', function(e){
                    var $input= $('.question-word');
                    var match = $input.val();
                    console.log(match);
                    App.sendReq('send', {
                        from: localStorage.loginer, 
                        to: Games.curGameId,
                        word: match
                    }, function(res){
                        if(res.error){
                            alert("没有这个单词");
                            return;
                        }
                        that.switchTo('main', {});
                    });
                });
                break;
            case 'answer':
                $('#answer').find('.answers-list').delegate('.answer-item', 'tap', function() {
                    App.sendReq('answer', {
                        id: $('.quiz-word').data('id'),
                        loginer: localStorage.loginer,
                        choice: $(this).data('section')
                    }, function(res){
                        if(res.correct){
                            alert('答对了')
                        }else{
                            var wl = localStorage.wronglist;
                            wl = JSON.parse(wl);
                            wl.push($('.quiz-word').text());
                            localStorage.wronglist = JSON.stringify(wl);
                            alert('答错了');
                        }
                        that.switchTo('main', {});
                    });
                    //TODO: 结果逻辑
                    //App.dialog.popin() //显示结果
                    return false;
                });
                break;
            }
        },
        switchTo: function(viewName, data) {
            var $slide = $('#content').find('.slide');
            var $curPage = $slide.find('.page');
            var nextPage = juicer(this.tpls[viewName], data);
            this.curView = viewName;

            $slide.append(nextPage);
            $curPage.addClass('remove');

            setTimeout(function() {
                $curPage.remove();
                $curPage = null;
            },
            500);

            this.initView(viewName);
            this.initEvent(viewName);
        },
        changeTo: function(viewName, data) {
            var $slide = $('#content').find('.slide');
            var $curPage = $slide.find('.page');
            var nextPage = juicer(this.tpls[viewName], data);
            this.curView = viewName;

            $curPage.remove();
            $curPage = null;
            $slide.append(nextPage);
            this.initView(viewName);
            this.initEvent(viewName);
        },
        initView: function(viewName) {
            var $homeBtn = $('.home');
            if (viewName !== 'main' && viewName !== "login" && viewName !== "signin") {
                $homeBtn.removeClass("hidden");
            }
            else {
                $homeBtn.addClass('hidden');
            }
        }
    };
    exports.Route = Route;
} (Zepto, window));

