angular
    .module("app.controllers")

    /**
     * @module profileCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the profile view.
     */
    .controller("profileCtrl", ["$scope", "$rootScope", "sharedProps", "$window", "$ionicLoading",
        function ($scope, $rootScope, sharedProps, $window, $ionicLoading) {
            var data = {};
            init();
            //sets the value of the user's sex based on their decision
            if ($scope.user.sex == 0)
                $scope.displaySex = "Female";
            else if ($scope.user.sex == 1)
                $scope.displaySex = "Male";
            else
                $scope.displaySex = "Other";

            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.profileCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                if (sharedProps.getData("isNightmode") != undefined) {
                    $scope.isNightmode = sharedProps.getData("isNightmode").value;
                }
                getFontSize();
            });

            /**
             * @function
             * @memberof controllerjs.profileCtrl
             * @description This function is responsible for retrieving the selected font size from the 
             * shared properties space and set the value into scope variables in order to be used in 
             * the page and set the page's font size.
             */
            function getFontSize() {
                //font size for normal letters
                $scope.fontsize = { 'font-size': data.fontsize + '%' }
                //font size for smaller letters than the normal ones
                $scope.fontsizeSmaller = { 'font-size': (data.fontsize - 20) + '%' }
            }

            /**
              * @function
              * @memberof controllerjs.profileCtrl
              * @description This function is responsible for retrieving the class used in the background
              * in order to set the background to nightmode/lightmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalBackground";
            };

            /**
              * @function
              * @memberof controllerjs.profileCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.profileCtrl
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
              */
            function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner><p>Loading profile...</p>',
                });

                //gets the currently active user
                $scope.user = $rootScope.activeUser;

                var usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));

                var currentUserSettings = _.find(usersSettings, function (userSettings) {
                    return userSettings.username == $rootScope.activeUser.username;
                });

                data = {
                    cachenewsEnabled: currentUserSettings.settings.cachenewsEnabled,
                    fontsize: currentUserSettings.settings.fontsize,
                    markupEnabled: currentUserSettings.settings.markupEnabled,
                    hideEnabled: currentUserSettings.settings.hideEnabled,
                    tolerance: currentUserSettings.settings.tolerance,
                };

                $ionicLoading.hide();
            }
        }
    ])