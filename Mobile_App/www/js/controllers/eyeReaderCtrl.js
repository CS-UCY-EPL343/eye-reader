
angular
.module("app.controllers")
   /**
     * @module eyeReaderCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the Side menu.
     */
    .controller("eyeReaderCtrl", ["$scope", "$stateParams", "$rootScope", "sharedProps", "$ionicPopup",
        "$state", "AuthenticationService",
        function ($scope, $stateParams, $rootScope, sharedProps, $ionicPopup, $state, AuthenticationService) {
            //the currently active usernewsfeed
            $scope.currUser = $rootScope.activeUser.username;

            /**
             * @name $rootScope.$on.usernameChange
             * @memberof controllerjs.eyeReaderCtrl
             * @description Executes actions when the message "usernameChange" is broadcasted in the controllers.
             *  Actions taken: 1) Gets the new username of the currently active user.
             */
            $rootScope.$on("usernameChange", function (event, args) {
                $scope.currUser = $rootScope.globals.currentUser.username;
            });

            /**
             * @name $rootScope.$on.nightmodeChange
             * @memberof controllerjs.eyeReaderCtrl
             * @description Executes actions when the message "nightmodeChange" is broadcasted in the controllers.
             *  Actions taken: 1) Gets the new value of the nightmode toggle that was set in the settings page.
             */
            $rootScope.$on("nightmodeChange", function (event, args) {
                $scope.isNightmode = args;
            });

            /**
             * @name $rootScope.$on.fontsizeChange
             * @memberof controllerjs.eyeReaderCtrl
             * @description Executes actions when the message "fontsizeChange" is broadcasted in the controllers.
             *  Actions taken: 1) Gets the new value of the font size that was set in the settings page.
             */
            $rootScope.$on("fontsizeChange", function (event, args) {
                $scope.selectedFontsize = { 'font-size': args + '%' };
            });

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description This function is responsible for retrieving the class used in the background
              * in order to set the background to nightmode/lightmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalBackground";
            };

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description This function is responsible for retrieving the class used as the sidemenu 
              * icons class in order to set the icon style to nightmode/lightmode.
              */
            $scope.getSidemenuIconClass = function () {
                return $scope.isNightmode ? "nightmodeSidemenuIcon" : "normalSidemenuIcon";
            };

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description This function is responsible for retrieving the class used in the header  
              * in order to set the header to nightmode/lightmode.
              */
            $scope.getNightmodeHeaderClass = function () {
                return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
            };

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description This function is responsible for displaying a warning popup that warns the user 
              * that they are about to logout. If the user selects "Confirm" then the popup closes and the 
              * user is logged out. Else if the user selects "Cancel" the popup closes.
              */
            $scope.logout = function () {
                var promptAlert = $ionicPopup.show({
                    title: "Warning",
                    template: '<span>Are you sure you want to <strong>logout</strong>?</span>',
                    buttons: [{
                        text: "Cancel",
                        type: "button-stable button-outline",
                        onTap: function (e) { }
                    }, {
                        text: "Confirm",
                        type: "button-positive",
                        onTap: function (e) {
                            AuthenticationService.ClearCredentials();
                            $state.go("login", $stateParams, { reload: true, inherit: false });
                        }
                    }]
                });
            };
        }
    ])