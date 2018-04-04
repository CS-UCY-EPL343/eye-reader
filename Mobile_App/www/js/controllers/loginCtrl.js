angular
    .module("app.controllers")

    /**
     * @module loginCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the edit login view.
     */
    .controller("loginCtrl", ["$scope", "sharedProps", "AuthenticationService",
        "$state", "$window", "$ionicPopup", "$ionicLoading", "$rootScope",
        function ($scope, sharedProps, AuthenticationService, $state, $window,
            $ionicPopup, $ionicLoading, $rootScope) {
            var usersSettings;
            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description This function is responsible for creating new values in the shared properties 
              * space for the new user's settings.
              */
            function createUserSettings() {

                //creates users settings local storage entry

                var currentUserSettings = {
                    username: $rootScope.activeUser.username,
                    settings: {
                        cachenewsEnabled: false,
                        fontsize: 100,
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

                //creates users deleted articles local storage entry
                var usersDeletedArticles = $window.localStorage.getItem("usersDeletedArticles");
                if (usersDeletedArticles == null || usersDeletedArticles == undefined){
                    usersDeletedArticles = [];
                }else{
                    usersDeletedArticles = JSON.parse(usersDeletedArticles);
                }
                var currUserDeletedArticles = {
                    username: $rootScope.activeUser.username,
                    articles : []
                };
                usersDeletedArticles.push(currUserDeletedArticles);
                $window.localStorage.setItem("usersDeletedArticles", JSON.stringify(usersDeletedArticles));

                // creates users selected sources local storage entry
                var usersSources = $window.localStorage.getItem("usersSources");
                if (usersSources == null || usersSources == undefined){
                    usersSources = [];
                } else {
                    usersSources = JSON.parse(usersSources);
                }
                var selectedSources = {
                    username: $rootScope.activeUser.username,
                    sources: []
                };
                usersSources.push(selectedSources);
                $window.localStorage.setItem("usersSources", JSON.stringify(usersSources));

                // creates users article cache local storage entry
                var usersArticleCache = $window.localStorage.getItem("usersArticleCache");
                if (usersArticleCache == null || usersArticleCache == undefined){
                    usersArticleCache = [];
                }else{
                    usersArticleCache = JSON.parse(usersArticleCache);
                }
                var articleCache = {
                    username: $rootScope.activeUser.username,
                    articles: []
                }
                usersArticleCache.push(articleCache);
                $window.localStorage.setItem("usersArticleCache", JSON.stringify(usersArticleCache));

                // creates users saved articles local storage entry

                var usersSavedArticles = $window.localStorage.getItem("usersSavedArticles");
                if (usersSavedArticles == null || usersSavedArticles == undefined) {
                    usersSavedArticles = [];
                } else {
                    usersSavedArticles = JSON.parse(usersSavedArticles);
                }
                var savedArticles = {
                    username: $rootScope.activeUser.username,
                    articles: []
                }
                usersSavedArticles.push(savedArticles);
                $window.localStorage.setItem("usersSavedArticles", JSON.stringify(usersSavedArticles));

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
                if (currentUserSettings != null || currentUserSettings != undefined) {
                    sharedProps.addData("isNightmode", false);
                    sharedProps.addData("cachenewsEnabled", currentUserSettings.cachenewsEnabled);
                    sharedProps.addData("fontsize", currentUserSettings.fontsize);
                    sharedProps.addData("fontsizeRange", currentUserSettings.fontsizeRange);
                    sharedProps.addData("markupEnabled", currentUserSettings.markupEnabled);
                    sharedProps.addData("hideEnabled", currentUserSettings.hideEnabled);
                    sharedProps.addData("tolerance", currentUserSettings.tolerance);
                } else {
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