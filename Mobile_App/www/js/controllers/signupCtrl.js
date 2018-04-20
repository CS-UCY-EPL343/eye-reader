angular
    .module("app.controllers")


    /**
     * @module signupCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the edit sign up view.
     */
    .controller("signupCtrl", ["$scope", "UserService", "$window",
        "$state", "$ionicPopup", "$ionicLoading", "$ionicHistory", "AuthenticationService", "$rootScope",
        function ($scope, UserService, $window, $state, $ionicPopup, $ionicLoading, $ionicHistory, AuthenticationService, $rootScope) {
            init();
            var usersSettings = [];

            /**
              * @function
              * @memberof controllerjs.signupCtrl
              * @description This function is responsible for sending the values of the new user's profile 
              * to be saved in the device's local storage and changes from the current page to the login page. 
              * If the profile saving fails, then an informative message is displayed.
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
              * @param {object} resp - The response message from when trying to save the profile details in the local storage.
              * @description This function is responsible for displaying an informative message that the new profile could not 
              * be created.
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

                $window.sessionStorage.setItem("isNightmode", JSON.stringify(false));
            }

            function loadUserSettings() {
                usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));
                var currentUserSettings = _.find(usersSettings, function (userSettings) {
                    return userSettings.username == $scope.user.username;
                });
                if (currentUserSettings != null || currentUserSettings != undefined) {
                    $window.sessionStorage.setItem("isNightmode", JSON.stringify(false));
                } else {
                    createUserSettings();
                }
            }

            /**
              * @function
              * @memberof controllerjs.signupCtrl
              * @description This function is responsible for requesting from the authentication service to 
              * login the user in the app. If the service replies with success, then the view is transfered to 
              * the news feed view. Else an informative message is displayed.
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
                            loadUserSettings();
                            $ionicLoading.hide();
                            $state.go("eyeReader.newsFeed");
                        }
                    }
                );
            };

            /**
            * @function
            * @memberof controllerjs.signupCtrl
            * @description This function is responsible for calling all the functions that need to 
            * be executed when the page is initialized.
            */
            function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner><p>Loading...</p>',
                });
                //$window.localStorage.clear();
                //creates ojects for the new user's profile
                $scope.user = {};
                $scope.sexOptions = [{ name: "Female", id: 0 }, { name: "Male", id: 1 }, { name: "Other", id: 2 }];
                $scope.user.sex = 0;
                $scope.user.birthday = new Date();
                $scope.user.firstTime = true;
                $ionicLoading.hide();
            }
        }
    ])