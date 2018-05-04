angular
    .module("app.controllers")


    /**
     * @module savedArticlesCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the saved articles view.
     */
    .controller("savedArticlesCtrl", ["$scope", "Server", "$http", "$window", "$rootScope", "ConnectionMonitor",
        "$notificationBar", "$ionicPopup", "$state",
        function ($scope, Server, $http, $window, $rootScope, ConnectionMonitor, $notificationBar, $ionicPopup, $state) {
            $scope.isOnline = ConnectionMonitor.isOnline();
            $scope.input = {};
            $scope.isLoading = true;
            $scope.checkboxes = {};
            var data = {};
            var usersReportedArticles = [];
            var usersSavedArticles = [];
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
             * @function
             * @memberof controllerjs.savedArticlesCtrl
             * @param {string} message The message to display
             * @param {int} duration The duration of the display
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            function displayToast(message, duration) {
                $notificationBar.setDuration(duration);
                $notificationBar.show(message, $notificationBar.EYEREADERCUSTOM);
            }
            /**
             * @name beforeEnter
             * @memberof controllerjs.savedArticlesCtrl
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
             * @memberof controllerjs.savedArticlesCtrl
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
              * @memberof controllerjs.savedArticlesCtrl
              * @description Sets the appropriate background class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode 
              * background.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.savedArticlesCtrl
              * @description Sets the appropriate font color class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.savedArticlesCtrl
              * @description Sets the appropriate font style class for headers in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
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
                                $scope.savedArticles.articles.splice(articleIndex, 0);
                                el.articles.splice(articleIndex, 1);
                                break;
                            }
                        }
                    }
                });
                $window.localStorage.setItem("usersSavedArticles", JSON.stringify(usersSavedArticles));
                displayToast("Article removed from saved!", 1000);
            }

            /**
              * @function
              * @memberof controllerjs.savedArticlesCtrl
              * @param {int} id The reported article's id
              * @description Responsible for displaying the report modal template. If the user selects either one
              * or both of the options and clicks "Confirm", then a request is sent to the server with the reported
              * article's source title for further statistics calculations.
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
                                displayToast("Article reported!", 1000);
                                $scope.reportedArticles.articles.push(id);

                                usersReportedArticles = _.filter(usersReportedArticles, function (ura) {
                                    return ura.username != $scope.reportedArticles.username;
                                });
                                usersReportedArticles.push($scope.reportedArticles);
                                $window.localStorage.setItem("usersReportedArticles", JSON.stringify(usersReportedArticles));
                            } else {
                                displayToast("Please check at least one option!", 1500);
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
              * @param {int} id The id of the article that is currently being checked
              * @returns {boolean} True if it's reported, False if it's not
              * @description Responsible for checking whether the current article has already been reported.
              * It searches in an array, that is saved in the local storage and returns true if the article is contained
              * or false if it's not. 
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
              * @description Responsible for calling all the functions and executing necessary functionalities 
              * once the page is loaded.
              * Such functionalities include: 
              * 1) Loading user's saved articles.
              * 2) Loading user's reported articles.
              */
            function init() {
                usersSavedArticles = JSON.parse($window.localStorage.getItem("usersSavedArticles"));
                $scope.savedArticles = _.find(usersSavedArticles, function (usa) {
                    return usa.username == $rootScope.activeUser.username;
                })

                usersReportedArticles = JSON.parse($window.localStorage.getItem("usersReportedArticles"));

                $scope.reportedArticles = _.find(usersReportedArticles, function (ura) {
                    return ura.username == $rootScope.activeUser.username;
                });

                $scope.isLoading = false;
            }
        }
    ])