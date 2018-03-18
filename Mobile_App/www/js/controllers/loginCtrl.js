angular
    .module("app.controllers")
  
    /**
     * @module loginCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the edit login view.
     */
    .controller("loginCtrl", ["$scope", "$stateParams", "sharedProps", "$location", "AuthenticationService",
        "$state", "$window", "$ionicPopup", "$ionicActionSheet", "$timeout", "$ionicLoading", "$rootScope",
        function ($scope, $stateParams, sharedProps, $location, AuthenticationService, $state, $window,
            $ionicPopup, $ionicActionSheet, $timeout, $ionicLoading, $rootScope) {
            var usersSettings;
            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description This function is responsible for creating new values in the shared properties 
              * space for the new user's settings.
              */
            function createUserSettings() {

                var currentUserSettings = {
                    username: $rootScope.activeUser.username,
                    settings: {
                        cachenewsEnabled: false,
                        fontsize: "100",
                        fontsizeRange: "16",
                        markupEnabled: false,
                        hideEnabled: false,
                        tolerance: 50
                    }
                };
                if (usersSettings == null || usersSettings == undefined)
                    usersSettings = [];
                usersSettings.push(currentUserSettings);

                $window.localStorage.setItem("usersSettings", JSON.stringify(usersSettings));

                sharedProps.addData("isNightmode", false);
                sharedProps.addData("cachenewsEnabled", currentUserSettings.settings.cachenewsEnabled);
                sharedProps.addData("fontsize", currentUserSettings.settings.fontsize);
                sharedProps.addData("markupEnabled", currentUserSettings.settings.markupEnabled);
                sharedProps.addData("hideEnabled", currentUserSettings.settings.hideEnabled);
                sharedProps.addData("tolerance", currentUserSettings.settings.tolerance);
            }

            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description This function is responsible for finding the logged in user's settings from 
              * the local storage and save them to shared properties space.
              */
            function loadUserSettings() {
                usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));
                var currentUserSettings = _.find(usersSettings, function (userSettings) {
                    return userSettings.username == $scope.login.username;
                });
                if (currentUserSettings != null || currentUserSettings != undefined){
                    sharedProps.addData("isNightmode", currentUserSettings.isNightmode);
                    sharedProps.addData("cachenewsEnabled", currentUserSettings.cachenewsEnabled);
                    sharedProps.addData("fontsize", currentUserSettings.fontsize);
                    sharedProps.addData("fontsizeRange", currentUserSettings.fontsizeRange);
                    sharedProps.addData("markupEnabled", currentUserSettings.markupEnabled);
                    sharedProps.addData("hideEnabled", currentUserSettings.hideEnabled);
                    sharedProps.addData("tolerance", currentUserSettings.tolerance);
                }else{
                    createUserSettings();
                }
            }

            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description This function is responsible for displaying an informative message if there was 
              * a problem with the user logging in the app.
              */
            function showFailedToLoginPopup(resp) {
                var promptAlert = $ionicPopup.show({
                    title: "Error",
                    template: '<span>Failed to login! ' + resp.message + '.</span>',
                    buttons: [{
                        text: "OK",
                        type: "button-positive",
                        onTap: function (e) { }
                    }]
                });
            };

            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description This function is responsible for requesting from the authentication service to 
              * login the user in the app. If the service replies with success, then the view is transfered to 
              * the news feed view. Else an informative message is displayed.
              */
            $scope.login = function () {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner>',
                });
                AuthenticationService.Login(
                    $scope.login.username,
                    $scope.login.password,
                    function (response) {
                        if (response.success) {
                            AuthenticationService.SetCredentials(
                                $scope.login.username,
                                $scope.login.password
                            );
                            loadUserSettings();
                            $ionicLoading.hide();
                            $state.go("eyeReader.newsFeed");
                        } else {
                            $ionicLoading.hide();
                            showFailedToLoginPopup(response);
                        }
                    }
                );
            };
        }
    ])