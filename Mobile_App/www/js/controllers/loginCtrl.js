angular
    .module("app.controllers")

    /**
     * @module loginCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the login view.
     */
    .controller("loginCtrl", ["$scope", "AuthenticationService", "$state", "$window", "$ionicPopup", "$ionicLoading", "$rootScope", "ConnectionMonitor",
        function ($scope, AuthenticationService, $state, $window, $ionicPopup, $ionicLoading, $rootScope, ConnectionMonitor) {
            var usersSettings;

            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description Responsible for creating the local storage entries for the current user.
              * These entries are:
              * 1) User Settings
              * 2) Deleted Articles
              * 3) Selected Sources
              * 4) Cached Articles
              * 5) Saved Articles
              * 6) Reported Articles
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

                $window.sessionStorage.setItem("isNightmode", JSON.stringify(false));
                $window.sessionStorage.setItem("fontsize", JSON.stringify(100));

                //creates users deleted articles local storage entry
                var usersDeletedArticles = $window.localStorage.getItem("usersDeletedArticles");
                if (usersDeletedArticles == null || usersDeletedArticles == undefined) {
                    usersDeletedArticles = [];
                } else {
                    usersDeletedArticles = JSON.parse(usersDeletedArticles);
                }
                var currUserDeletedArticles = {
                    username: $rootScope.activeUser.username,
                    articles: []
                };
                usersDeletedArticles.push(currUserDeletedArticles);
                $window.localStorage.setItem("usersDeletedArticles", JSON.stringify(usersDeletedArticles));

                // creates users selected sources local storage entry
                var usersSources = $window.localStorage.getItem("usersSources");
                if (usersSources == null || usersSources == undefined) {
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
                if (usersArticleCache == null || usersArticleCache == undefined) {
                    usersArticleCache = [];
                } else {
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

                // creates users reported articles local storage entry
                var usersReportedArticles = $window.localStorage.getItem("usersReportedArticles");
                if (usersReportedArticles == null || usersReportedArticles == undefined) {
                    usersReportedArticles = [];
                } else {
                    usersReportedArticles = JSON.parse(usersReportedArticles);
                }
                var reportedArticles = {
                    username: $rootScope.activeUser.username,
                    articles: []
                }
                usersReportedArticles.push(reportedArticles);
                $window.localStorage.setItem("usersReportedArticles", JSON.stringify(usersReportedArticles));
            }

            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description Responsible for searching for the current user's settings in the local storage. 
              * If there aren't any, it calls createUserSettings() in order to generate all the necessary entires
              * in the local storage.
              */
            function findUserSettings() {
                usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));
                var currentUserSettings = _.find(usersSettings, function (userSettings) {
                    return userSettings.username == $scope.login.username;
                });
                if (currentUserSettings != null || currentUserSettings != undefined) {
                    $window.sessionStorage.setItem("isNightmode", JSON.stringify(false));
                    $window.sessionStorage.setItem("fontsize", JSON.stringify(currentUserSettings.settings.fontsize));
                } else {
                    createUserSettings();
                }
            }

            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description Responsible for displaying an informational popup if the user failed to login.
              */
            function showFailedToLoginPopup(resp) {
                $ionicPopup.alert({
                    title: "Error",
                    template: '<span>Failed to login! ' + resp.message + '.</span>',
                });
            };

            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description Responsible for attempting to login the user. It passes the user's username and password
              * in the Authentication Service. If the login was successful then the user is redirected tot he news feed 
              * page. If not then the login failure popup is displayed.
              */
            $scope.login = function () {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner><p>Logging in...</p>',
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
                            findUserSettings();
                            $ionicLoading.hide();
                            if (ConnectionMonitor.isOnline())
                                $state.go("eyeReader.newsFeed");
                            else
                                $state.go("eyeReader.cachedNewsFeed");
                        } else {
                            $ionicLoading.hide();
                            showFailedToLoginPopup(response);
                        }
                    }
                );
            };
        }
    ])