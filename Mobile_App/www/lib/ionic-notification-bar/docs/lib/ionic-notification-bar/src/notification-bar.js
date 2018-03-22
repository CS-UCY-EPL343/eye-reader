/**
 * Guillaume Emery - https://github.com/guysmv/ionic-notification-bar
 * Licensed under the MIT License
 */
angular.module('ionic-notification-bar', ['ionic'])
    .service('$notificationBar', function ($log) {
        this.timer = 3000;
        this.handler = undefined;
        this.isVisible = false;

        //name of the CSS classes : you can add you own!
        this.SUCCESS = 'success';
        this.ALERT = 'alert';
        this.INFO = 'info';

        this.show = function (message, type) {
            var context = this;
            if (this.isVisible === true) {
                this.remove();
            }
            angular.element(document.body).append("<div class='snack " + type + "'>" + message + "</div>");
            this.isVisible = true;
            this.handler = setTimeout(function () {
                angular.element(document.querySelector('.snack')).addClass('snack-exit');
                setTimeout(function () {
                    context.remove();
                }, 200);
            }, this.timer - 200);
        };
        this.remove = function () {
            var tab = angular.element(document.body).children();
            for (var i = tab.length - 1; i > 0; i--) {
                if (tab[i].className.indexOf('snack') > - 1) {
                    tab[i].remove();
                    this.isVisible = false;
                    clearTimeout(this.handler);
                    break;
                }
            }
        };
        this.setDuration = function (value) {
            if (angular.isDefined(value) && Number.isInteger(value)) {
                this.timer = 3000;
            }
            else $log.error("Value specified in setDuration is not an integer (value is in miliseconds ; default is 3000)!");
        };
    });