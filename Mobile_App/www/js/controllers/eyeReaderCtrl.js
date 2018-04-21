
angular
    .module("app.controllers")
    /**
      * @module eyeReaderCtrl
      * @memberof controllerjs
      * @description Controller for the functionalities implemented for the side menu.
      */
    .controller("eyeReaderCtrl", ["$scope", "$stateParams", "$rootScope", "$ionicPopup",
        "$state", "AuthenticationService", "$ionicModal", "$window",
        function ($scope, $stateParams, $rootScope, $ionicPopup, $state, AuthenticationService, $ionicModal, $window) {
            //the currently active usernewsfeed
            $scope.currUser = $rootScope.activeUser.username;
            init();
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
             *  Actions taken: 1) Gets the new nightmode toggle value.
             */
            $rootScope.$on("nightmodeChange", function (event, args) {
                $scope.isNightmode = args;
            });

            /**
             * @name $rootScope.$on.fontsizeChange
             * @memberof controllerjs.eyeReaderCtrl
             * @description Executes actions when the message "fontsizeChange" is broadcasted in the controllers.
             *  Actions taken: 1) Gets the new font size value.
             */
            $rootScope.$on("fontsizeChange", function (event, args) {
                $scope.selectedFontsize = { 'font-size': args + '%' };
            });

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description Sets the appropriate background class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode 
              * background.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalBackground";
            };

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description Sets the appropriate font color class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description Sets the appropriate color class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * for the icon's color.
              */
            $scope.getSidemenuIconClass = function () {
                return $scope.isNightmode ? "nightmodeSidemenuIcon" : "normalSidemenuIcon";
            };

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description Sets the appropriate font style class for headers in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getNightmodeHeaderClass = function () {
                return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
            };

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description Responsible for displaying a warning message to the user if they click logout. Then, if the 
              * user clicks "Confirm", the user gets logged out and their credentials are cleared from the AuthenticationService
              * and applications rootScope.
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

            $ionicModal.fromTemplateUrl('templates/tutorial.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.openModal = function () {
                $scope.modal.show();
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
            };
            // Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description Responsible for calling all the functions and executing necessary functionalities 
              * once the page is loaded.
              * Such functionalities include: 
              * 1) Loading current user's selected font size.
              */
            function init() {
                $scope.selectedFontsize = { 'font-size': JSON.parse($window.sessionStorage.getItem("fontsize")) + '%' };
            }
        }
    ])