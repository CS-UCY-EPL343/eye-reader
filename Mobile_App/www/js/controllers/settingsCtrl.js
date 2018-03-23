
angular
    .module("app.controllers")

    /**
     * @module settingsCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the Settings page.
     */
    .controller("settingsCtrl", ["$scope", "$rootScope", "sharedProps",
        "$window", "$ionicLoading", "$ionicSideMenuDelegate",
        function ($scope, $rootScope, sharedProps, $window, $ionicLoading, $ionicSideMenuDelegate) {
            var usersSettings = {};
            var currentUserSettings = {};
            var tempSettings = {};
            init();

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description This function is responsible for saving the selected settings in the user's 
              * settings in the device's local storage
              */
            function saveUserSettings() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner><p>Saving Settings</p>',
                });
                sharedProps.addData("isNightmode", $scope.data.isNightmode);
                sharedProps.addData("cachenewsEnabled", $scope.data.cachenewsEnabled);
                sharedProps.addData("fontsize", $scope.data.fontsize);
                sharedProps.addData("fontsizeRange", $scope.data.fontsizeRange);
                sharedProps.addData("markupEnabled", $scope.data.markupEnabled);
                sharedProps.addData("hideEnabled", $scope.data.hideEnabled);
                sharedProps.addData("tolerance", $scope.data.tolerance);

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
                $ionicLoading.hide();
            }

            /**
             * @function
             * @memberof controllerjs.settingsCtrl
             * @description This function is responsible for matching the selected value from the font size 
             * range bar to the actual font size value.
             * (font size of range bar is in pixel values and the actual font size metric used is percentage)
             */
            function getFontsizeRangeVal(f) {
                if (!f)
                    f = sharedProps.getData("fontsize");
                if (f == undefined)
                    return 16;
                else {
                    if (f.value == 87.5)
                        return 14;
                    else if (f.value == 100)
                        return 16;
                    else if (f.value == 112.5)
                        return 18;
                    else
                        return 20;
                }
            }

            $scope.$watch(function () {
                return $ionicSideMenuDelegate.getOpenRatio();
            }, function (ratio) {
                if (ratio == 1) {
                    saveUserSettings();
                }
            });

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description This function is responsible for adding the value of the nightmode toggle to the 
              * shared properties space and to broadcast it to the other controllers in order for the sidemenu 
              * controller to recieve it and change it's background value according to the toggle's value.
              */
            $scope.setNightmode = function () {
                $rootScope.$broadcast("nightmodeChange", $scope.data.isNightmode);
                sharedProps.addData("isNightmode", $scope.data.isNightmode);
            };

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description This function is responsible for matching the selected value from the font size 
              * range bar to the actual font size value in order to display it in pixels in the page. 
              * (font size of range bar is in pixel values and the actual font size metric used is percentage)
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
             * @description This function is responsible for retrieving the class used in the background
             * in order to set the ba
                sharedProps.addData("cachenewsEnabled", $scope.data.cachenewsEnabled);
                sharedProps.addData("markupEnabled", $scope.data.markupEnabled);
                sharedProps.addData("hideEnabled", $scope.data.hideEnabled);
                sharedProps.addData("tolerance", $scope.data.tolerance);ckground to nightmode/lightmode.
             */
            $scope.getBackgroundClass = function () {
                return $scope.data.isNightmode ?
                    "nightmodeBackgroundMain" :
                    "normalBackgroundMain";
            };

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.data.isNightmode ?
                    "nightmodeFontColor" :
                    "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
              */
            function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner>',
                });

                usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));

                currentUserSettings = _.find(usersSettings, function (userSettings) {
                    return userSettings.username == $rootScope.activeUser.username;
                });

                $scope.data = {
                    isNightmode: sharedProps.getData("isNightmode").value,
                    cachenewsEnabled: currentUserSettings.settings.cachenewsEnabled,
                    fontsize: currentUserSettings.settings.fontsize,
                    fontsizeRange: currentUserSettings.settings.fontsizeRange,
                    markupEnabled: currentUserSettings.settings.markupEnabled,
                    hideEnabled: currentUserSettings.settings.hideEnabled,
                    tolerance: currentUserSettings.settings.tolerance,
                };
                sharedProps.addData("cachenewsEnabled", $scope.data.cachenewsEnabled);
                sharedProps.addData("fontsize", $scope.data.fontsize);
                sharedProps.addData("fontsizeRange", $scope.data.fontsizeRange);
                sharedProps.addData("markupEnabled", $scope.data.markupEnabled);
                sharedProps.addData("hideEnabled", $scope.data.hideEnabled);
                sharedProps.addData("tolerance", $scope.data.tolerance);

                $ionicLoading.hide();
            }
        }
    ])