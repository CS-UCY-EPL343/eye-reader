
angular.module('app', ['ionic', 'ngCordova', 'app.controllers', 'app.routes', 'app.directives', 'app.services'])

    .config(function ($ionicConfigProvider, $sceDelegateProvider) {

        $sceDelegateProvider.resourceUrlWhitelist(['self', '*://www.youtube.com/**', '*://player.vimeo.com/video/**']);

        $ionicConfigProvider.scrolling.jsScrolling(false);

    })

    .run(function ($ionicPlatform, $rootScope, $window, Application, $state, ConnectionMonitor, $ionicPopup, AuthenticationService, $stateParams) {
        // Disable BACK button on home
        $ionicPlatform.registerBackButtonAction(function (event) {
            $ionicPopup.confirm({
                title: "Warning",
                template: '<span>Are you sure you want to <strong>logout</strong>?</span>',
            }).then(function (res) {
                if (res) {
                    AuthenticationService.ClearCredentials();
                    $state.go("login", $stateParams, { reload: true, inherit: false });
                }
            })
        }, 100);
        $ionicPlatform.ready(function () {

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            // if (window.StatusBar) {
            //     // org.apache.cordova.statusbar required
            //     StatusBar.styleDefault();
            // }

            if (Application.isInitialRun()) {
                $state.go('welcome');
            } else {
                $state.go('login');
            }
        });
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
    })

    .constant('Server', {
        'baseUrl': 'https://eye-reader.herokuapp.com/',
    }); 