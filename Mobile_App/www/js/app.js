/**
 * @module appjs
 * @description Default module create by Ionic v1 and and AngularJS for app operations.
 */
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives', 'app.services'])

    .config(function ($ionicConfigProvider, $sceDelegateProvider) {

        $sceDelegateProvider.resourceUrlWhitelist(['self', '*://www.youtube.com/**', '*://player.vimeo.com/video/**']);

        $ionicConfigProvider.scrolling.jsScrolling(false);

    })

    /**
     * @module run
     * @memberof appjs
     * @description Operations executed during runtime.
     */
    .run(function ($ionicPlatform, sharedProps, $rootScope, $window) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            ionic.Platform.fullScreen();
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                // StatusBar.styleDefault();
                return StatusBar.hide();
            }
        });

        /**
         * @name $ionicPlatform.on
         * @param {string} type See {@link https://ionicframework.com/docs/v1/api/service/$ionicPlatform/} for more details
         * @memberof appjs.run
         */
        $ionicPlatform.on('pause', function () {
            console.log("saving settings");
            saveUserSettings();
        });

        /**
         * @function
         * @memberof appjs.run
         * @description This function is responsible for saving the currently logged in user's settings 
         * in the device's local storage. It creates a temporary array that holds the user's settings. Then
         * it retrieves the settings of all the users from the local storage, filters out the current logged in 
         * user's settings and saves the new settings. 
         */
        function saveUserSettings() {
            //New user settings
            var tempUserSettings = [
                {
                    username: $rootScope.globals.currentUser.username,
                    isNightmode: sharedProps.getData("isNightmode"),
                    cachenewsEnabled: sharedProps.getData("cachenewsEnabled"),
                    fontsize: sharedProps.getData("fontsize"),
                    markupEnabled: sharedProps.getData("markupEnabled"),
                    hideEnabled: sharedProps.getData("hideEnabled"),
                    tolerance: sharedProps.getData("tolerance"),
                    savedArticlesIds: sharedProps.getData("savedArticlesIds")
                }
            ]

            //all users settings
            var usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));
            //currently saved settings
            var currentUserSettings = _.filter(usersSettings, function (userSettings) {
                userSettings.username != tempUserSettings.username;
            });
            usersSettings.push(tempUserSettings);

            $window.localStorage.setItem("usersSettings", JSON.stringify(usersSettings));
        }
    })

    .directive('disableSideMenuDrag', ['$ionicSideMenuDelegate', '$rootScope', function ($ionicSideMenuDelegate, $rootScope) {
        return {
            restrict: "A",
            controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

                function stopDrag() {
                    $ionicSideMenuDelegate.canDragContent(false);
                }

                function allowDrag() {
                    $ionicSideMenuDelegate.canDragContent(true);
                }

                $rootScope.$on('$ionicSlides.slideChangeEnd', allowDrag);
                $element.on('touchstart', stopDrag);
                $element.on('touchend', allowDrag);
                $element.on('mousedown', stopDrag);
                $element.on('mouseup', allowDrag);

            }]
        };
    }])

    .directive('hrefInappbrowser', function () {
        return {
            restrict: 'A',
            replace: false,
            transclude: false,
            link: function (scope, element, attrs) {
                var href = attrs['hrefInappbrowser'];

                attrs.$observe('hrefInappbrowser', function (val) {
                    href = val;
                });

                element.bind('click', function (event) {

                    window.open(href, '_system', 'location=yes');

                    event.preventDefault();
                    event.stopPropagation();

                });
            }
        };
    });