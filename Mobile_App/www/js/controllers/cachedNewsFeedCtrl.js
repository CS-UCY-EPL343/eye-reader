
angular
    .module("app.controllers")

    /**
     * @module cachednewsFeedCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the news feed view.
     */
    .controller("cachednewsFeedCtrl", ["$scope", "$ionicPopup", "$ionicModal",
        "$localStorage", "$window", "$notificationBar", "$rootScope", "ConnectionMonitor", "$state", "$stateParams",
        function ($scope, $ionicPopup, $ionicModal, $localStorage, $window, $notificationBar,
            $rootScope, ConnectionMonitor, $state, $stateParams) {
            $scope.input = {};
            $scope.articles = [];
            $scope.isOnline = ConnectionMonitor.isOnline();
            $scope.isLoading = true;
            var articleCache = [];
            var data = {};
            var usersSavedArticles = [];
            var usersDeletedArticles = [];
            var networkAlert;

            init();

            /**
             * @function
             * @memberof controllerjs.cachednewsFeedCtrl
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
              * @memberof controllerjs.cachednewsFeedCtrl
              * @param {int} id The id of the article that is currently being deleted
              * @description Responsible for checking whether the current article has already been deleted.
              * It searches in an array, that is saved in the local storage and returns true if the article is contained
              * or false if it's not. 
             */
            $scope.isDeleted = function (id) {
                return $scope.deletedArticles.articles.includes(id);
            }

            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.cachednewsFeedCtrl
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
             * @memberof controllerjs.cachednewsFeedCtrl
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
              * @memberof controllerjs.cachednewsFeedCtrl
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
              * @memberof controllerjs.cachednewsFeedCtrl
              * @param {int} id The id of the article that is currently being saved
              * @description Responsible for adding the article's id to the current user's saved articles. Once added,
              * the saved articles are stored back in the local storage.
              */
            function saveArticle(id) {
                $scope.cachedArticles.articles.find(function (s) {
                    if (s.Id === id) {
                        $scope.savedArticles.articles.push(s);
                    }
                });

                usersSavedArticles.forEach(el => {
                    if (el.username == $scope.savedArticles.username) {
                        el.articles = $scope.savedArticles.articles;
                    }
                });
                $window.localStorage.setItem("usersSavedArticles", JSON.stringify(usersSavedArticles));
            }

            /**
              * @function
              * @memberof controllerjs.cachednewsFeedCtrl
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
              * @memberof controllerjs.cachednewsFeedCtrl
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
              * @memberof controllerjs.cachednewsFeedCtrl
              * @description Sets the appropriate background class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode 
              * background.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.cachednewsFeedCtrl
              * @description Sets the appropriate font color class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.cachednewsFeedCtrl
              * @description Sets the appropriate font style class for headers in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getNightmodeHeaderClass = function () {
                return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
            };

            /**
              * @function
              * @memberof controllerjs.cachednewsFeedCtrl
              * @param {int} aid The id of the article to be viewed
              * @description Responsible for redirecting the app to the article view and passes as a parameter the article's id
              * in order to fetch the article later in the article view. Also it sends a request to the server in order to 
              * increase the click counter for the article's source.
              */
            $scope.articleTapped = function (aid) {
                if (!$scope.isOnline) {
                    var promptAlert = $ionicPopup.show({
                        title: "Warning",
                        template: "<span>Cannot open article. No internet connection available!</span>",
                        buttons: [{
                            text: "OK",
                            type: "button-positive",
                            onTap: function (e) {
                            }
                        }]
                    })
                } else {
                    $state.go("eyeReader.article", { id: aid });
                }
            }

            $scope.articleTappedCache = function (aid) {
                $state.go("eyeReader.article", { id: aid });
            }

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
              * @memberof controllerjs.cachednewsFeedCtrl
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
              * @memberof controllerjs.cachednewsFeedCtrl
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
                    fontsize: currentUserSettings.settings.fontsize,
                    tolerance: currentUserSettings.settings.tolerance
                };
            }

            /**
              * @function
              * @memberof controllerjs.cachednewsFeedCtrl
              * @description Responsible for calling all the functions and executing necessary functionalities 
              * once the page is loaded.
              * Such functionalities include: 
              * 1) Initializing the tutorial modal.
              * 2) Loading necessary data with the loadNecessaryData function
              * 3) If there are cached articles, it loads the cached articles in view.
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
                $scope.cachedArticles = _.find(articleCache, function (ac) {
                    return ac.username == $rootScope.activeUser.username;
                });
                console.log($scope.isLoading);
                console.log($scope.cachedArticles);
                $scope.isLoading = false;
            }
        }
    ])