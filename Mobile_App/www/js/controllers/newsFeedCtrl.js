
angular
    .module("app.controllers")

    /**
     * @module newsFeedCtrl
     * @description Controller controlling the functionalities implemented for the News Feed page.
     */
    .controller("newsFeedCtrl", ["$scope", "$http", "sharedProps", "$ionicPopup",
        "$localStorage", "$ionicLoading", "$window", "$notificationBar", "$rootScope", "ConnectionMonitor",
        function ($scope, $http, sharedProps, $ionicPopup,
            $localStorage, $ionicLoading, $window, $notificationBar, $rootScope, ConnectionMonitor) {
            var data = {};
            init();

            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.newsFeedCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the saved articles from the local storage
             *           3) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                if (sharedProps.getData("isNightmode") != undefined)
                    $scope.isNightmode = sharedProps.getData("isNightmode").value;
                var temp = $window.localStorage.getItem("savedArticles");
                if (temp)
                    $scope.savedArticles = JSON.parse($window.localStorage.getItem("savedArticles"));
                else
                    $scope.savedArticles = [];
                getFontSize();
            });

            /**
             * @function
             * @memberof controllerjs.newsFeedCtrl
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
              * @memberof controllerjs.newsFeedCtrl
              * @description This function is responsible for displaying the popup when a user wants to report 
              * an article. The popup is ionic's default and uses the reportArticle.html temlpate.
              */
            $scope.showReportOptions = function (sourceid) {
                var promptAlert = $ionicPopup.show({
                    title: "Report",
                    templateUrl: "templates/reportArticle.html",
                    buttons: [{
                        text: "Cancel",
                        type: "button-stable button-outline",
                        onTap: function (e) { }
                    },
                    {
                        text: "Confirm",
                        type: "button-positive",
                        onTap: function (e) {
                            //we have to put an id for each source so we can calculate the reporrts of each source
                            //TODO
                            // $http.post("https://eye-reader.herokuapp.com/"+sourceid+"/report");
                            $notificationBar.setDuration(700);
                            $notificationBar.show("Article reported!", $notificationBar.EYEREADERCUSTOM);
                        }
                    }
                    ]
                });
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id - The id of the article to save/unsave
              * @description This function is responsible for deciding wether to add an article to saved 
              * or remove an article from saved. Firstly, it checks if the article is saved. If it is then 
              * it is removed from saved and displays an informative message. Else it adds the article to 
              * saved and displays an informative message.
              */
            $scope.saveArticle = function (id) {
                if ($scope.isArticleSaved(id)) {
                    unsaveArticle(id);
                    showRemovedToast();
                    return;
                }
                saveArticle(id);
                showSavedToast();
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id - The id of the article to save
              * @description This function is responsible for adding the article to the saved articles.
              */
            function saveArticle(id) {
                $scope.articles.find(function (s) {
                    if (s.Id === id) {
                        $scope.savedArticles.push(s);
                    }
                });
                $window.localStorage.setItem("savedArticles", JSON.stringify($scope.savedArticles));
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id - The id of the article to check
              * @description This function is responsible for checking if the article given is saved or not.
              */
            $scope.isArticleSaved = function (id) {
                return $scope.savedArticles.find(function (s) {
                    if (s.Id === id) {
                        return true;
                    }
                });
                return false;
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id - The id of the article to delete
              * @description This function is responsible for deleting an article from the news feed. Firstly 
              * it finds the article in the list of articles and then it splices the array of articles in order 
              * to remove it.
              */
            function deleteArticle(id) {
                var article = _.find($scope.articles, function (a) {
                    return a.Id == id;
                })
                article.Deleted = true;
                $scope.articles.splice(_.indexOf($scope.articles, article), 1);
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id - The id of the article to delete
              * @description This function is responsible for displaying a popup in order to warn the user 
              * that they are about to delete an article. If the user clicks "Confirm" then the article is deleted 
              * and the popup is closed. If the user clicks "Cancel" then the article is not removed and the 
              * popup is closed.
              */
            $scope.showDeleteConfirm = function (id) {
                var promptAlert = $ionicPopup.show({
                    title: "Warning",
                    template: "<span>Are you sure you want to delete this article?</span>",
                    buttons: [{
                        text: "Cancel",
                        type: "button-stable button-outline",
                        onTap: function (e) {
                            //e.preventDefault();
                        }
                    },
                    {
                        text: "Confirm",
                        type: "button-positive",
                        onTap: function (e) {
                            deleteArticle(id);
                            showDeletedToast();
                        }
                    }
                    ]
                });
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description This function is responsible for displaying an informative text that the selected article 
              * was deleted from the feed.
              */
            function showDeletedToast() {
                $notificationBar.setDuration(700);
                $notificationBar.show("Article deleted!", $notificationBar.EYEREADERCUSTOM);
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id - The id of the article to unsave
              * @description This function is responsible for finding the selected article and remove it from 
              * the array with the saved articles by splicing the array on the article's position.
              */
            function unsaveArticle(id) {
                //TODO: FIX HERE
                var articleIndex = $scope.savedArticles.findIndex(function (s) {
                    return s.Id == id;
                });
                $scope.savedArticles.splice(articleIndex, 1);
                $window.localStorage.setItem("savedArticles", JSON.stringify($scope.savedArticles));
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description This function is responsible for displaying an informative text 
              * when the article is saved.
              */
            function showSavedToast() {
                //set duration is not working. must be set from within the plugin's js file 
                //default value = 700ms
                $notificationBar.setDuration(700);
                $notificationBar.show("Article added to saved!", $notificationBar.EYEREADERCUSTOM);
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description This function is responsible for displaying an informative text 
              * when the article is removed from saved.
              */
            function showRemovedToast() {
                //set duration is not working. must be set from within the plugin's js file.
                //default value = 700ms
                $notificationBar.setDuration(700);
                $notificationBar.show("Article removed from saved!", $notificationBar.EYEREADERCUSTOM);
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description This function is responsible for refreshing the news feed and retrieving 
              * new articles from the server.
              */
            $scope.doRefresh = function () {
                $http.get("./test_data/articles/templateArticle.js").then(function (res) {
                    $scope.articles = res.data;
                    $scope.$broadcast('scroll.refreshComplete');
                });
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description This function is responsible for loading more articles in the feed from the 
              * articles that have already been fetched from the server.
              */
            $scope.loadMore = function () {

                // $http.post('<url>', {})
                // .success(function(res){
                //   $scope.posts = $scope.posts.concat(res.posts);  
                // })
                // .finally(function() {
                //   $scope.$broadcast('scroll.infiniteScrollComplete');
                //   $scope.$broadcast('scroll.refreshComplete');
                // });
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description This function is responsible for retrieving the class used in the the background 
              * in order to set the background to nightmode/normalmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description This function is responsible for retrieving the class used in the header  
              * in order to set the header to nightmode/lightmode.
              */
            $scope.getNightmodeHeaderClass = function () {
                return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description This function is responsible for rsending a request to the server in order 
              * to increase the click counter of a source
              */
            $scope.articleTapped = function (sourceid) {
                // $http.post("https://eye-reader.herokuapp.com/"+sourceid+"/click");
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
              */
            function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner><p>Loading articles...</p>',
                });

                $scope.selectedSources = JSON.parse($window.localStorage.getItem("selectedSources"));

                if (!$scope.selectedSources)
                    $scope.selectedSources = [];

                //TODO: REMOVE THIS LINE 
                $scope.selectedSources = ["test", "test2", "test3"];

                // $http.get("https://eye-reader.herokuapp.com/articles/").then(function(res){
                //     $scope.articles = res.data;
                //     $ionicLoading.hide();
                // });

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

                $rootScope.$broadcast('fontsizeChange', data.fontsize + 20);

                /**
                 * @name $http.get
                 * @memberof controllerjs.newsFeedCtrl
                 * @description Executes a request to the application's server in order to retrieve the articles and their 
                 * details. The server's response is saved in a scope variable in order to be accessible from 
                 * the html.
                 */
                $http.get("./test_data/articles/templateArticle.js").then(function (res) {
                    $scope.articles = res.data;
                }).then($ionicLoading.hide);


            }
        }
    ])