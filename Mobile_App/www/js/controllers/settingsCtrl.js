
angular
    .module("app.controllers")

    /**
     * @module settingsCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the settings view.
     */
    .controller("settingsCtrl", ["$scope", "$rootScope", "$window", "$ionicSideMenuDelegate",
        function ($scope, $rootScope, $window, $ionicSideMenuDelegate) {
            var usersSettings = {};
            var currentUserSettings = {};
            var tempSettings = {};
            init();

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description Responsible for saving the new settings under the user's entry in the local storage.
              * Also it saved in the session storage the font size used for easier font management across pages.
              */
            function saveUserSettings() {
                $window.sessionStorage.setItem("isNightmode", JSON.stringify($scope.data.isNightmode));

                currentUserSettings.settings.cachenewsEnabled = $scope.data.cachenewsEnabled;
                currentUserSettings.settings.fontsize = $scope.fontsize;
                currentUserSettings.settings.fontsizeRange = $scope.data.fontsizeRange;
                currentUserSettings.settings.markupEnabled = $scope.data.markupEnabled;
                currentUserSettings.settings.hideEnabled = $scope.data.hideEnabled;
                currentUserSettings.settings.tolerance = $scope.data.tolerance;

                usersSettings = _.filter(usersSettings, function (us) {
                    return us.username != currentUserSettings.username;
                });

                usersSettings.push(currentUserSettings);
                $window.localStorage.setItem("usersSettings", JSON.stringify(usersSettings));
                $window.sessionStorage.setItem("fontsize", JSON.stringify(currentUserSettings.settings.fontsize));
            }

            $scope.$watch(function () {
                return $ionicSideMenuDelegate.getOpenRatio();
            }, function (ratio) {
                if (ratio == 1)
                    saveUserSettings();
            });

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description Responsible for broadcasting across the application the value of the nightmode toggle.
              * Also it saves the value of the nightmode in the session storage for easier background class management
              * across the pages.
              */
            $scope.setNightmode = function () {
                $rootScope.$broadcast("nightmodeChange", $scope.data.isNightmode);
                $window.sessionStorage.setItem("isNightmode", JSON.stringify($scope.data.isNightmode));
            };

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description Responsible for matching the value of the font size range bar to the appropriate font size
              * percentage used. Also it broadcasts the changed value across the app.
              */
            $scope.$watch("data.fontsizeRange", function () {
                if ($scope.data.fontsizeRange == 14)
                    $scope.fontsize = 87.5;
                else if ($scope.data.fontsizeRange == 16)
                    $scope.fontsize = 100;
                else if ($scope.data.fontsizeRange == 18)
                    $scope.fontsize = 112.5;
                else
                    $scope.fontsize = 125;
                $scope.selectedFontsize = { 'font-size': $scope.fontsize + '%' }
                $rootScope.$broadcast('fontsizeChange', $scope.fontsize + 20);
            });

            /**
             * @function
             * @memberof controllerjs.settingsCtrl
              * @description Sets the appropriate background class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode 
              * background.
             */
            $scope.getBackgroundClass = function () {
                return $scope.data.isNightmode ?
                    "nightmodeBackgroundMain" :
                    "normalBackgroundMain";
            };

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description Sets the appropriate font color class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getFontClass = function () {
                return $scope.data.isNightmode ?
                    "nightmodeFontColor" :
                    "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description Responsible for calling all the functions and executing necessary functionalities 
              * once the page is loaded.
              * Such functionalities include: 
              * 1) Loading current user's settings.
              */
            function init() {
                usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));

                currentUserSettings = _.find(usersSettings, function (userSettings) {
                    return userSettings.username == $rootScope.activeUser.username;
                });

                $scope.data = {
                    isNightmode: JSON.parse($window.sessionStorage.getItem("isNightmode")),
                    cachenewsEnabled: currentUserSettings.settings.cachenewsEnabled,
                    fontsize: currentUserSettings.settings.fontsize,
                    fontsizeRange: currentUserSettings.settings.fontsizeRange,
                    markupEnabled: currentUserSettings.settings.markupEnabled,
                    hideEnabled: currentUserSettings.settings.hideEnabled,
                    tolerance: currentUserSettings.settings.tolerance,
                };
            }
        }
    ])