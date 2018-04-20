angular
    .module("app.controllers")


    /**
     * @module savedArticlesCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the saved articles view.
     */
    .controller("savedArticlesCtrl", ["$scope", "Server", "$http", "$window", "$rootScope", "ConnectionMonitor", "$notificationBar", "$ionicPopup",
        function ($scope, Server, $http, $window, $rootScope, ConnectionMonitor, $notificationBar, $ionicPopup) {
            $scope.isOnline = ConnectionMonitor.isOnline();
            var data = {};
            var usersReportedArticles = [];
            $scope.input = {};
            var usersSavedArticles = [];
            $scope.isLoading = true;
            $scope.checkboxes = {};
            init();

            /**
             * @name beforeEnter
             * @memberof controllerjs.savedArticlesCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                getFontSize();
            });
            
            /**
             * @function
             * @memberof controllerjs.savedArticlesCtrl
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
              * @memberof controllerjs.savedArticlesCtrl
              * @description This function is responsible for retrieving the class used in the background
              * in order to set the background to nightmode/lightmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.savedArticlesCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.savedArticlesCtrl
              * @description This function is responsible for retrieving the class used in the header  
              * in order to set the header to nightmode/lightmode.
              */
            $scope.getNightmodeHeaderClass = function () {
                return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
            };


            /**
              * @function
              * @memberof controllerjs.savedArticlesCtrl
              * @param {int} id - The id of the article to unsave
              * @description This function is responsible for finding the selected article and remove it from 
              * the array with the saved articles by splicing the array on the article's position.
              */
            $scope.unsaveArticle = function (id) {
                var articleIndex = 0;
                usersSavedArticles.forEach(el => {
                    if (el.username == $rootScope.activeUser.username) {
                        for (let i = 0; i < el.articles.length; i++) {
                            if (el.articles[i].Id == id) {
                                articleIndex = i;
                                $scope.savedArticles.articles.splice(articleIndex,0);
                                el.articles.splice(articleIndex,1);
                                break;
                            }
                        }
                    }
                });
                
                $window.localStorage.setItem("usersSavedArticles", JSON.stringify(usersSavedArticles));

                showRemovedToast();
            }


            /**
              * @function
              * @memberof controllerjs.savedArticlesCtrl
              * @description This function is responsible for displaying an informative text 
              * when the article is removed from saved.
              */
            function showRemovedToast() {
                $notificationBar.setDuration(1000);
                $notificationBar.show("Article removed from saved!", $notificationBar.EYEREADERCUSTOM);
            }

            /**
              * @function
              * @memberof controllerjs.savedArticlesCtrl
              * @description This function is responsible for displaying the popup when a user wants to report 
              * an article. The popup is ionic's default and uses the reportArticle.html temlpate.
              */
            $scope.showReportOptions = function (id) {
                $scope.checkboxes.hatespeech = false;
                $scope.checkboxes.fakenews = false;
                var promptAlert = $ionicPopup.show({
                    title: "Report",
                    templateUrl: "templates/reportArticle.html",
                    scope: $scope,
                    buttons: [{
                        text: "Cancel",
                        type: "button-stable button-outline"
                    },
                    {
                        text: "Confirm",
                        type: "button-positive",
                        onTap: function (e) {
                            if ($scope.checkboxes.hatespeech || $scope.checkboxes.fakenews) {
                                $http.get(Server.baseUrl + "articles/" + id + "/report");
                                $notificationBar.setDuration(1000);
                                $notificationBar.show("Article reported!", $notificationBar.EYEREADERCUSTOM);
                                $scope.reportedArticles.articles.push(id);

                                usersReportedArticles = _.filter(usersReportedArticles, function (ura) {
                                    return ura.username != $scope.reportedArticles.username;
                                });
                                usersReportedArticles.push($scope.reportedArticles);
                                $window.localStorage.setItem("usersReportedArticles", JSON.stringify(usersReportedArticles));
                            } else {
                                $notificationBar.setDuration(1500);
                                $notificationBar.show("Please check at least one option!", $notificationBar.EYEREADERCUSTOM);
                                e.preventDefault();
                            }
                        }
                    }
                    ]
                });
            };

            /**
              * @function
              * @memberof controllerjs.savedArticlesCtrl
              * @param {int} id - The id of the article to check
              * @description This function is responsible for checking if the article given is saved or not.
              */
            $scope.isArticleReported = function (id) {
                if ($scope.reportedArticles.articles.length == 0)
                    return false;
                var found;
                $scope.reportedArticles.articles.forEach(e => {
                    if (e == id)
                        found = true;
                });
                return found;
            };

            /**
              * @function
              * @memberof controllerjs.savedArticlesCtrl
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
              */
            function init() {
                usersSavedArticles = JSON.parse($window.localStorage.getItem("usersSavedArticles"));
                $scope.savedArticles = _.find(usersSavedArticles, function (usa) {
                    return usa.username == $rootScope.activeUser.username;
                })
                var n = JSON.parse($window.sessionStorage.getItem("isNightmode"));
                if (n != undefined) {
                    $scope.isNightmode = n;
                }

                usersReportedArticles = JSON.parse($window.localStorage.getItem("usersReportedArticles"));

                $scope.reportedArticles = _.find(usersReportedArticles, function (ura) {
                    return ura.username == $rootScope.activeUser.username;
                });

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

                $scope.isLoading = false;
            }
        }
    ])