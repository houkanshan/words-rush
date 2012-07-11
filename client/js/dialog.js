(function($, exports) {
    var Dialog = Dialog || {};
    Dialog = {
        $overlay: null,
        $overlayBox: null,
        initialize: function() {
            this.$overlay = $('#overlay');
            this.$overlayBox = this.$overlay.find('.overlay-box');
            this.$overlayBack = this.$overlay.find('.overlay-back');

            this.$overlayBack.tap($.proxy(function() {
                this.popout();
            },
            this));
        },

        delegateEvent: function(selector, events, context) {
            var eventSplitter = /^(\w+)\s*(.*)$/;
            var $view = $(selector);

            for (var key in events) {
                var method = events[key];
                if(typeof method !== 'function'){
                    console.log('[err]not a function');
                    return;
                }
                method = $.proxy(method, context);

                var match = key.match(eventSplitter);
                var eventName = match[1];
                var childSelector = match[2];
                console.log('delegateEvent: childSelector: ', childSelector);
                
                $view.find(childSelector).bind(eventName, method);
            }
        },
        popin: function(view, events) {
            //handle view
            this.$overlayBox.html(view);
            this.$overlayBox.delegate('.close', 'tap', $.proxy(function(){
                this.popout();
            }, this));
            this.delegateEvent('#overlay', events, App);

            // pop it
            this.$overlay.removeClass('hidden');
            var that = this;
            setTimeout(function() {
                that.$overlayBox.removeClass('minium');
            },
            100);
        },
        popout: function(callback) {
            this.$overlayBox.addClass('minium');
            setTimeout($.proxy(function() {
                this.$overlay.addClass('hidden');
                this.$overlayBox.html('');
                callback && callback();
            },
            this), 200);
        }
    };
    exports.Dialog = Dialog;
} (Zepto, window));

