
angular
    .module("app.controllers")

    /**
     * @module newsFeedCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the news feed view.
     */
    .controller("newsFeedCtrl", ["$scope", "$q", "Server", "$http", "$ionicPopup", "$ionicModal",
        "$localStorage", "$window", "$notificationBar", "$rootScope", "ConnectionMonitor", "$interval", "$state",
        function ($scope, $q, Server, $http, $ionicPopup, $ionicModal, $localStorage, $window, $notificationBar,
            $rootScope, ConnectionMonitor, $interval, $state) {
            $scope.input = {};
            $scope.articles = [];
            $scope.isOnline = ConnectionMonitor.isOnline();
            $scope.checkboxes = {};
            $scope.isLoading = true;
            var usersDeletedArticles = [];
            var articleCache = [];
            var data = {};
            var usersSavedArticles = [];
            var usersReportedArticles = [];
            var repeatArticleFetch;
            init();

            /**
             * @function
             * @memberof controllerjs.newsFeedCtrl
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
             * @function
             * @memberof controllerjs.newsFeedCtrl
             * @description Invokes a repeat that every 15 minutes it calls the requestArticles function.
             */
            function startRepeatArticleFetch() {
                if (angular.isDefined(repeatArticleFetch)) return;
                repeatArticleFetch = $interval(function () {
                    requestArticles();
                }, 900000);
            }

            /**
             * @function
             * @memberof controllerjs.newsFeedCtrl
             * @description Stops the repeat of requestArticles function.
             */
            function stopRepeatArticleFetch() {
                if (angular.isDefined(repeatArticleFetch)) {
                    $interval.cancel(repeatArticleFetch);
                    repeatArticleFetch = undefined;
                }
            }

            $rootScope.$on('$locationChangeSuccess', function () {
                stopRepeatArticleFetch();
            });

            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.newsFeedCtrl
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
             * @memberof controllerjs.newsFeedCtrl
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
              * @memberof controllerjs.newsFeedCtrl
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
                                $http.get(Server.baseUrl + 'articles/' + id + "/report");
                                displayToast("Article reported!", 1000);

                                $scope.reportedArticles.articles.push(id);

                                usersReportedArticles = _.filter(usersReportedArticles, function (ura) {
                                    return ura.username != $scope.reportedArticles.username;
                                });
                                usersReportedArticles.push($scope.reportedArticles);
                                $window.localStorage.setItem("usersReportedArticles", JSON.stringify(usersReportedArticles));

                            } else {
                                displayToast("Please check at least one option!", 2000);
                                e.preventDefault();
                            }
                        }
                    }
                    ]
                });
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
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
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id The id of the article that is currently being saved
              * @description Responsible for saving or unsaving the article from the current user's saved articles that are 
              * located in the local storage. It checks if the article is already saved, by checking in the article's id is 
              * contained in an array with the current user's saved articles. If it is, then it removes it, else it adds it 
              * and then stores the saved articles back in the local storage. Lastly, it shows an informational toast that
              * the article has been removed/added.
              */
            $scope.save_unsaveArticle = function (id) {
                if ($scope.isArticleSaved(id)) {
                    unsaveArticle(id);
                    displayToast("Article removed from saved!", 1000);
                    return;
                }
                saveArticle(id);
                displayToast("Article added to saved!", 1000);
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id The id of the article that is currently being saved
              * @description Responsible for adding the article's id to the current user's saved articles. Once added,
              * the saved articles are stored back in the local storage.
              */
            function saveArticle(id) {
                if ($scope.isOnline) {
                    $scope.articles.find(function (s) {
                        if (s.Id === id) {
                            $scope.savedArticles.articles.push(s);
                        }
                    });
                } else {
                    $scope.cachedArticles.articles.find(function (s) {
                        if (s.Id === id) {
                            $scope.savedArticles.articles.push(s);
                        }
                    });
                }
                usersSavedArticles.forEach(el => {
                    if (el.username == $scope.savedArticles.username) {
                        el.articles = $scope.savedArticles.articles;
                    }
                });
                $window.localStorage.setItem("usersSavedArticles", JSON.stringify(usersSavedArticles));
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id The id of the article that is currently being saved
              * @returns {boolean} True if it's saved, False if it's not
              * @description Responsible for checking whether the current article has already been saved.
              * It searches in an array, that is saved in the local storage and returns true if the article is contained
              * or false if it's not. 
              */
            $scope.isArticleSaved = function (id) {
                if ($scope.savedArticles.articles.length == 0)
                    return false;
                var found = $scope.savedArticles.articles.find(s => s.Id === id);
                if (found != null || found != undefined)
                    return true;
                return false;
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id The id of the article that is currently being deleted
              * @description Responsible for removing the article's id from the current user's saved articles. Once removed,
              * the saved articles are stored back in the local storage.
              */
            function deleteArticle(id) {
                $scope.deletedArticles.articles.push(id);

                usersDeletedArticles = _.filter(usersDeletedArticles, function (uda) {
                    return uda.username != $scope.deletedArticles.username;
                });
                usersDeletedArticles.push($scope.deletedArticles);
                $window.localStorage.setItem("usersDeletedArticles", JSON.stringify(usersDeletedArticles));
                var index;
                for (let i = 0; i < $scope.articles.length; i++) {
                    if ($scope.articles[i].Id == id)
                        index = i;
                }
                $scope.articles.splice(index, 1);
            }

            /**
             * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id The id of the article that is currently being deleted
              * @description Responsible for checking whether the current article has already been deleted.
              * It searches in an array, that is saved in the local storage and returns true if the article is contained
              * or false if it's not. 
             */
            $scope.isDeleted = function (id) {
                return $scope.deletedArticles.articles.includes(id);
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id The id of the article that is currently being deleted
              * @description Responsible for displaying the delete modal template. If the user clicks "Confirm", 
              * then the article's id is added in an array with all the current user's deleted articles. Then the array
              * is stored back in the local storage. Lastly, it displays an informational toast that the article
              * has been deleted. 
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
                            displayToast("Article deleted!", 1000);
                        }
                    }
                    ]
                });
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id - The id of the article to unsave
              * @description This function is responsible for finding the selected article and remove it from 
              * the array with the saved articles by splicing the array on the article's position.
              */
            function unsaveArticle(id) {
                var articleIndex = $scope.savedArticles.articles.findIndex(s => s.Id == id);

                $scope.savedArticles.articles.splice(articleIndex, 1);

                usersSavedArticles.forEach(user => {
                    if (user.username == $scope.savedArticles.username) {
                        user.articles = $scope.savedArticles.articles;
                    }
                });
                $window.localStorage.setItem("usersSavedArticles", JSON.stringify(usersSavedArticles));
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description Responsible for refreshing the news feed and retrieving articles from the server.
              * Then it filters out the articles that are already in the news feed and pushes in the feed the new 
              * articles.
              */
            $scope.doRefresh = function () {
                var requests = [];

                for (var i = 0; i < $scope.selectedSources.sources.length; i++) {
                    requests.push($http.get(Server.baseUrl + 'articles/from/' + $scope.selectedSources.sources[i]));
                }
                $q.all(requests).then(function (res) {
                    res.forEach(el => {
                        if (Array.isArray(el.data)) {
                            el.data.forEach(d => {
                                let isContained = _.find($scope.articles, function (art) {
                                    return art.Id == d.Id;
                                })
                                if (isContained == undefined || isContained == null)
                                    $scope.articles.push(d);
                            });
                        }
                    });
                    if (data.cachenewsEnabled) {
                        for (var i = 0; i < $scope.articles.length; i++) {
                            if (i < 10)
                                $scope.cachedArticles.push($scope.articles[i]);
                        }
                        cacheArticles();
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                }).catch(function (error) { });
            }

            $scope.loadMore = function () {
                //TODO
                // $http.get("./test_data/articles/templateArticle.js").then(function (res) {
                //     $scope.articles = res.data;
                // }).then(function () {

                //     if (data.cachenewsEnabled) {
                //         for (var i = 0; i < $scope.articles.length; i++) {
                //             if (i < 5) {
                //                 $scope.cachedArticles.push($scope.articles[i]);
                //             }
                //         }
                //     }
                //     cacheArticles();

                //     $ionicLoading.hide();
                // });
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description Sets the appropriate background class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode 
              * background.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description Sets the appropriate font color class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description Sets the appropriate font style class for headers in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getNightmodeHeaderClass = function () {
                return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
            };

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} aid The id of the article to be viewed
              * @description Responsible for redirecting the app to the article view and passes as a parameter the article's id
              * in order to fetch the article later in the article view. Also it sends a request to the server in order to 
              * increase the click counter for the article's source.
              */
            $scope.articleTapped = function (aid) {
                $http.get(Server.baseUrl + 'articles/' + aid + "/click");
                $state.go("eyeReader.article", { id: aid });
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description Responsible for saving the cached articles of the current user to the local storage.
              */
            function cacheArticles() {
                articleCache = _.filter(articleCache, function (ac) {
                    return ac.username != $rootScope.activeUser.username;
                });

                var cached = {
                    username: $rootScope.activeUser.username,
                    articles: $scope.cachedArticles
                };

                articleCache.push(cached);

                $window.localStorage.setItem("usersArticleCache", JSON.stringify(articleCache));
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description Responsible for emptying out the cached news if the cache news option is disabled
              * in the settings.
              */
            function emptyCache() {
                articleCache = _.filter(articleCache, function (ac) {
                    return ac.username != $rootScope.activeUser.username;
                });

                $window.localStorage.setItem("usersArticleCache", JSON.stringify(articleCache));
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description Responsible for checking if this is the first time the current user is logging in 
              * the application. If it is, then it displays the tutorial.
              */
            function openTutorial() {
                var users = JSON.parse($window.localStorage.getItem("users"));
                users.forEach(el => {
                    if (el.username == $rootScope.activeUser.username) {
                        if (el.firstTime) {
                            el.firstTime = false;
                            $scope.openModal();
                            $window.localStorage.setItem("users", JSON.stringify(users));
                        }
                    }
                });
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description Responsible for retrieving articles from the server
              * every 15 minutes in order to keep the feed updated in real time.
              */
            function requestArticles() {
                $scope.doRefresh();
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description Responsible for loading all the necessary information of the current user 
              * that are needed from the local storage, such as: deleted articles, selected sources, 
              * settings, saved articles, reported articles.
              */
            function loadNecessaryData() {
                usersDeletedArticles = JSON.parse($window.localStorage.getItem("usersDeletedArticles"));

                $scope.deletedArticles = _.find(usersDeletedArticles, function (uda) {
                    return uda.username == $rootScope.activeUser.username;
                });

                var usersSources = JSON.parse($window.localStorage.getItem("usersSources"));

                $scope.selectedSources = _.find(usersSources, function (userSources) {
                    return userSources.username == $rootScope.activeUser.username;
                });

                var usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));

                var currentUserSettings = _.find(usersSettings, function (userSettings) {
                    return userSettings.username == $rootScope.activeUser.username;
                });

                usersSavedArticles = JSON.parse($window.localStorage.getItem("usersSavedArticles"));
                $scope.savedArticles = _.find(usersSavedArticles, function (usa) {
                    return usa.username == $rootScope.activeUser.username;
                });

                usersReportedArticles = JSON.parse($window.localStorage.getItem("usersReportedArticles"));

                $scope.reportedArticles = _.find(usersReportedArticles, function (ura) {
                    return ura.username == $rootScope.activeUser.username;
                });

                data = {
                    cachenewsEnabled: currentUserSettings.settings.cachenewsEnabled,
                    fontsize: currentUserSettings.settings.fontsize
                };
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description Responsible for calling all the functions and executing necessary functionalities 
              * once the page is loaded.
              * Such functionalities include: 
              * 1) Initializing the tutorial modal.
              * 2) Loading necessary data with the loadNecessaryData function
              * 3) If the user is online it retrieves articles from the server
              * 4) If the user is online and caching is enabled, it caches the top 10 articles in the feed.
              * 5) If the user is offline and if there are cached articles, it loads the cached articles in view.
              */
            function init() {
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

                $ionicModal.fromTemplateUrl('templates/tutorial.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                    openTutorial();
                });

                loadNecessaryData();

                articleCache = JSON.parse($window.localStorage.getItem("usersArticleCache"));
                $scope.cachedArticles = [];
                if ($scope.isOnline && $scope.selectedSources.sources.length > 0) {
                    var requests = [];

                    for (var i = 0; i < $scope.selectedSources.sources.length; i++) {
                        requests.push($http.get(Server.baseUrl + 'articles/from/' + $scope.selectedSources.sources[i]));
                    }
                    $q.all(requests).then(function (res) {
                        res.forEach(el => {
                            if (Array.isArray(el.data)) {
                                el.data.forEach(d => {
                                    if (!_.contains($scope.deletedArticles.articles, d.Id)) {
                                        $scope.articles.push(d);
                                    }
                                });
                            }
                        });
                        $scope.isLoading = false;
                        if (data.cachenewsEnabled) {
                            for (var i = 0; i < $scope.articles.length; i++) {
                                if (i < 10) {
                                    $scope.cachedArticles.push($scope.articles[i]);
                                }
                            }
                            cacheArticles();
                        } else {
                            emptyCache();
                        }
                        startRepeatArticleFetch();

                        $scope.isLoading = false;
                    }).catch(function (error) {
                        $scope.isLoading = false;
                    });
                } else if (!$scope.isOnline) {
                    $scope.cachedArticles = _.find(articleCache, function (ac) {
                        return ac.username == $rootScope.activeUser.username;
                    });
                    $scope.isLoading = false;
                } else {
                    $scope.isLoading = false;
                }
            }
        }
    ])