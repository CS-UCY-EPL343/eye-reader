angular
    .module("app.controllers")

    /**
     * @module editProfileCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the edit profile view.
     */
    .controller("editProfileCtrl", ["$scope", "$rootScope", "$state", "UserService", "$window", "$ionicPopup",
        function ($scope, $rootScope, $state, UserService, $window, $ionicPopup) {
            $scope.input = {};
            var data = {};
            var username = "";
            var networkAlert;
            init();

            
            var networkChange = $scope.$on("networkChange", function (event, args) {
                if (!networkAlert)
                    networkAlert = $ionicPopup.alert({
                        title: "Warning",
                        template: "<span>Internet connection changed. Please login again!</span>",
                    }).then(function (res) {
                        $scope.isOnline = args;
                        $state.go("login", { reload: true, inherit: false, cache: false });
                    });
            });

            $scope.$on("$destroy", function () {
                networkChange();
            })

            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.editProfileCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                var n = JSON.parse($window.sessionStorage.getItem("isNightmode"));
                if (n != undefined)
                    $scope.isNightmode = n;
                data.fontsize = JSON.parse($window.sessionStorage.getItem("fontsize"));
                getFontSize();
            });

            /**
             * @function
             * @memberof controllerjs.editProfileCtrl
             * @description Sets 2 scope variables that represent 2 different font-sizes. These variables
             * are used in the page as ng-style attributes. 
             */
            function getFontSize() {
                //font size for normal letters
                $scope.fontsize = { 'font-size': data.fontsize + '%' }
                //font size for smaller letters than the normal ones
                $scope.fontsizeSmaller = { 'font-size': (data.fontsize - 20) + '%' }
            }

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description Sets the appropriate background class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode 
              * background.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description Sets the appropriate font color class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description Responsible for updating all entries in the local storage with the new username
              * if the username has changed.
              */
            function UpdateStorage() {
                var usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));
                var usersDeletedArticles = JSON.parse($window.localStorage.getItem("usersDeletedArticles"));
                var usersSources = JSON.parse($window.localStorage.getItem("usersSources"));
                var usersArticleCache = JSON.parse($window.localStorage.getItem("usersArticleCache"));
                var usersSavedArticles = JSON.parse($window.localStorage.getItem("usersSavedArticles"));
                var usersReportedArticles = JSON.parse($window.localStorage.getItem("usersReportedArticles"));
                var usersArticlesNotes = JSON.parse($window.localStorage.getItem("usersArticlesNotes"));

                usersSettings.forEach(el => {
                    if (el.username == username)
                        el.username = $scope.editedUser.username;
                });
                if (usersArticlesNotes != undefined || usersArticlesNotes != null) {
                    usersArticlesNotes.forEach(el => {
                        if (el.username == username)
                            el.username = $scope.editedUser.username;
                    });
                }
                usersReportedArticles.forEach(el => {
                    if (el.username == username)
                        el.username = $scope.editedUser.username;
                });
                usersDeletedArticles.forEach(el => {
                    if (el.username == username)
                        el.username = $scope.editedUser.username;
                });
                usersSources.forEach(el => {
                    if (el.username == username)
                        el.username = $scope.editedUser.username;
                });
                usersArticleCache.forEach(el => {
                    if (el.username == username)
                        el.username = $scope.editedUser.username;
                });
                usersSavedArticles.forEach(el => {
                    if (el.username == username)
                        el.username = $scope.editedUser.username;
                });

                $window.localStorage.setItem("usersSettings", JSON.stringify(usersSettings));
                $window.localStorage.setItem("usersDeletedArticles", JSON.stringify(usersDeletedArticles));
                $window.localStorage.setItem("usersSources", JSON.stringify(usersSources));
                $window.localStorage.setItem("usersArticleCache", JSON.stringify(usersArticleCache));
                $window.localStorage.setItem("usersSavedArticles", JSON.stringify(usersSavedArticles));
                $window.localStorage.setItem("usersReportedArticles", JSON.stringify(usersReportedArticles));
                $window.localStorage.setItem("usersArticlesNotes", JSON.stringify(usersArticlesNotes));
            }

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description Responsible for setting a flag if the newly inserted username is already taken. If
              * it's not, then it sends the data to the UserService to update the current user's information.
              */
            $scope.editProfile = function () {
                if (username != $scope.editedUser.username) {
                    for (let i = 0; i < users.length; i++) {
                        if (users[i].username == $scope.editedUser.username) {
                            $scope.input.usernameTaken = true;
                            break;
                        } else {
                            $scope.input.usernameTaken = false;
                        }
                    }
                } else {
                    $scope.input.usernameTaken = false;
                }

                if (!$scope.input.usernameTaken) {
                    if (username != $scope.editedUser.username)
                        UpdateStorage();
                    UserService.Update($scope.editedUser).then(function (response) {
                        if (response.success) {
                            $rootScope.$broadcast("usernameChange", $scope.editedUser.username);
                            $state.go("eyeReader.profile");
                        } else {
                            var promptAlert = $ionicPopup.show({
                                title: "Error",
                                template: "<span>Failed to update user's profile!</span>",
                                buttons: [{
                                    text: "Retry",
                                    type: "button-positive",
                                    onTap: function (e) { }
                                }]
                            });
                        }
                    });
                }
            }

            $scope.goBack = function () {
                $state.go("eyeReader.profile");
            };

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description Responsible for calling all the functions and executing necessary functionalities 
              * once the page is loaded.
              * Such functionalities include: 
              * 1) Loading current user's detailes.
              * 2) Loading all the users usernames.
              * 3) Loading current user's details.
              */
            function init() {
                users = JSON.parse($window.localStorage.getItem("users"));

                //sets the value of the user's sex based on their decision
                $scope.sexOptions = [
                    { name: "Female", id: 0 },
                    { name: "Male", id: 1 },
                    { name: "Other", id: 2 }
                ];
                $scope.user = $rootScope.activeUser;
                username = $scope.user.username;
                $scope.editedUser = $scope.user;
                $scope.selectedSex = $scope.editedUser.sex;
                $scope.editedUser.birthday = new Date($scope.editedUser.birthday);
            }
        }
    ])