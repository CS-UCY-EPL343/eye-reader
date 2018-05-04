angular
    .module("app.controllers")


    /**
     * @module signupCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the sign up view.
     */
    .controller("signupCtrl", ["$scope", "UserService", "$window", "$state", "$ionicPopup", "$ionicLoading", "AuthenticationService", "$rootScope", "ConnectionMonitor",
        function ($scope, UserService, $window, $state, $ionicPopup, $ionicLoading, AuthenticationService, $rootScope, ConnectionMonitor) {
            var usersSettings = [];
            init();

            /**
              * @function
              * @memberof controllerjs.signupCtrl
              * @description Responsible for registering the new user. It sends the new user's info in the UserService 
              * and if the registration was successful it logins the user, else it displays an informational popup with
              * the according error message.
              */
            $scope.register = function () {
                UserService.Create($scope.user).then(function (response) {
                    if (response.success)
                        login();
                    else
                        showFailedToRegisterPopup(response);
                });
            };

            /**
              * @function
              * @memberof controllerjs.signupCtrl
              * @param {object} resp The response message from when trying to save the profile details in the local storage.
              * @description Responsible for displaying an informational error message if the registration has failed.
              */
            function showFailedToRegisterPopup(resp) {
                var promptAlert = $ionicPopup.show({
                    title: "Error",
                    template: '<span>Failed to register! ' + resp.message + '.</span>',
                    buttons: [{
                        text: "OK",
                        type: "button-positive",
                        onTap: function (e) { }
                    }]
                });
            };

            $scope.goBack = function () {
                $state.go("login");
            }

            /**
              * @function
              * @memberof controllerjs.signupCtrl
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
              * @memberof controllerjs.signupCtrl
              * @description Responsible for attempting to login the user. It passes the user's username and password
              * in the Authentication Service. If the login was successful then the user is redirected tot he news feed 
              * page. If not then the login failure popup is displayed.
              */
            function login() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner><p>Logging in...</p>',
                });
                AuthenticationService.Login(
                    $scope.user.username,
                    $scope.user.password,
                    function (response) {
                        if (response.success) {
                            AuthenticationService.SetCredentials(
                                $scope.user.username,
                                $scope.user.password
                            );
                            createUserSettings();
                            $ionicLoading.hide();
                            if (ConnectionMonitor.isOnline())
                                $state.go("eyeReader.newsFeed");
                            else
                                $state.go("eyeReader.cachedNewsFeed");
                        }
                    }
                );
            };

            /**
              * @function
              * @memberof controllerjs.signupCtrl
              * @description Responsible for calling all the functions and executing necessary functionalities 
              * once the page is loaded.
              * Such functionalities include: 
              * 1) Initialize sex options for the sex selection dropdown.
              * 2) Initialized birthday, sex and firstTime login values for the new user.
              */
            function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner><p>Loading...</p>',
                });
                $scope.sexOptions = [{ name: "Female", id: 0 }, { name: "Male", id: 1 }, { name: "Other", id: 2 }];
                //creates ojects for the new user's profile
                $scope.user = {};
                $scope.user.sex = 0;
                $scope.user.birthday = new Date();
                $scope.user.firstTime = true;
                $ionicLoading.hide();
            }
        }
    ])