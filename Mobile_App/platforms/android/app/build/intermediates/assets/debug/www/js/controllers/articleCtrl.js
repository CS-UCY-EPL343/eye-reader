angular
    .module("app.controllers")

    /**
     * @module articleCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the article view.
     */
    .controller("articleCtrl", ["$scope", "$sce", "$http", "Server", "ConnectionMonitor", "$stateParams", "$rootScope",
        "$window", "$ionicHistory", "$notificationBar", "$ionicPopup", "$ionicPopover", "$state",
        function ($scope, $sce, $http, Server, ConnectionMonitor, $stateParams, $rootScope, $window, $ionicHistory, $notificationBar,
            $ionicPopup, $ionicPopover, $state) {
            $scope.isLoading = true;
            $scope.isOnline = ConnectionMonitor.isOnline();
            $scope.checkboxes = {};
            var data = {};
            var articles = [];
            var usersSavedArticles = [];
            var usersDeletedArticles = [];
            var usersReportedArticles = [];
            var networkAlert;

            /**
             * @function
             * @memberof controllerjs.articleCtrl
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
             * @memberof controllerjs.articleCtrl
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
              * @memberof controllerjs.articleCtrl
              * @description Responsible for displaying the report modal template. If the user selects either one
              * or both of the options and clicks "Confirm", then a request is sent to the server with the reported
              * article's source title for further statistics calculations.
              */
            $scope.showReportOptions = function () {
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
                                $http.get(Server.baseUrl + 'articles/' + $scope.article.Id + "/report");
                                displayToast("Article reported!", 1000);

                                $scope.reportedArticles.articles.push($scope.article.Id);

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
              * @memberof controllerjs.articleCtrl
              * @returns {boolean} True if it's reported, False if it's not
              * @description Responsible for checking whether the current article has already been reported.
              * It searches in an array, that is saved in the local storage and returns true if the article is contained
              * or false if it's not. 
              */
            $scope.isArticleReported = function () {
                if ($scope.isLoading)
                    return false;
                if ($scope.reportedArticles.articles.length == 0)
                    return false;
                var found;
                $scope.reportedArticles.articles.forEach(e => {
                    if (e == $scope.article.Id)
                        found = true;
                });
                return found;
            };

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description Responsible for saving or unsaving the article from the current user's saved articles that are 
              * located in the local storage. It checks if the article is already saved, by checking in the article's id is 
              * contained in an array with the current user's saved articles. If it is, then it removes it, else it adds it 
              * and then stores the saved articles back in the local storage. Lastly, it shows an informational toast that
              * the article has been removed/added.
              */
            $scope.save_unsaveArticle = function () {
                if ($scope.isArticleSaved()) {
                    unsaveArticle();
                    displayToast("Article removed from saved!", 1000);
                    return;
                }
                saveArticle();
                displayToast("Article added to saved!", 1000);
            };

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description Responsible for adding the article's id to the current user's saved articles. Once added,
              * the saved articles are stored back in the local storage.
              */
            function saveArticle() {
                $scope.savedArticles.articles.push($scope.article);

                usersSavedArticles.forEach(el => {
                    if (el.username == $scope.savedArticles.username) {
                        el.articles = $scope.savedArticles.articles;
                    }
                });
                $window.localStorage.setItem("usersSavedArticles", JSON.stringify(usersSavedArticles));
            }

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description Responsible for removing the article's id from the current user's saved articles. Once removed,
              * the saved articles are stored back in the local storage.
              */
            function unsaveArticle() {
                var articleIndex = $scope.savedArticles.articles.findIndex(s => s.Id == $scope.article.Id);

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
              * @memberof controllerjs.articleCtrl
              * @returns {boolean} True if it's saved, False if it's not
              * @description Responsible for checking whether the current article has already been saved.
              * It searches in an array, that is saved in the local storage and returns true if the article is contained
              * or false if it's not. 
              */
            $scope.isArticleSaved = function () {
                if ($scope.isLoading)
                    return;
                if ($scope.savedArticles.articles.length == 0)
                    return false;
                var found = $scope.savedArticles.articles.find(s => s.Id === $scope.article.Id);
                if (found != null || found != undefined)
                    return true;
                return false;
            };

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description Responsible for removing the article's id from the current user's saved articles. Once removed,
              * the saved articles are stored back in the local storage.
              */
            function deleteArticle() {
                $scope.deletedArticles.articles.push($scope.article.Id);

                usersDeletedArticles = _.filter(usersDeletedArticles, function (uda) {
                    return uda.username != $scope.deletedArticles.username;
                });
                usersDeletedArticles.push($scope.deletedArticles);
                $window.localStorage.setItem("usersDeletedArticles", JSON.stringify(usersDeletedArticles));
            }

            /**
             * @function
             * @memberof controllerjs.articleCtrl
              * @returns {boolean} True if it's deleted, False if it's not
              * @description Responsible for checking whether the current article has already been deleted.
              * It searches in an array, that is saved in the local storage and returns true if the article is contained
              * or false if it's not. 
             */
            $scope.isDeleted = function () {
                if ($scope.isLoading)
                    return;
                return $scope.deletedArticles.articles.includes($scope.article.Id);
            }

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description Responsible for displaying the delete modal template. If the user clicks "Confirm", 
              * then the article's id is added in an array with all the current user's deleted articles. Then the array
              * is stored back in the local storage. Lastly, it displays an informational toast that the article
              * has been deleted. 
              */
            $scope.showDeleteConfirm = function () {
                $ionicPopup.confirm({
                    title: "Warning",
                    template: "<span>Are you sure you want to delete this article?</span>",
                }).then(function (res) {
                    if (res) {
                        deleteArticle();
                        displayToast("Article deleted!", 1000);
                    }
                });
            };

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description Responsible for finding the current article's notes from the local storage entry of the
              * current user and store on top of them the new notes.
              */
            $scope.saveNotes = function () {

                if (activeUserNotes == undefined || activeUserNotes == null) {
                    activeUserNotes = {
                        username: $rootScope.activeUser.username,
                        notes: []
                    };
                } else {
                    activeUserNotes.notes = _.filter(activeUserNotes.notes, function (el) {
                        return el.id != $scope.currentNotes.id;
                    })
                    if (activeUserNotes.notes != undefined || activeUserNotes.notes != null) {
                        for (var i = 0; i < activeUserNotes.notes.length; i++) {
                            if (activeUserNotes.notes[i].id == $scope.currentNotes.id) {
                                activeUserNotes.notes[i].note = $scope.currentNotes.note;
                            }
                        }
                    } else {
                        activeUserNotes.notes = [];
                    }
                }
                activeUserNotes.notes.push($scope.currentNotes);
                articlesNotes = _.filter(articlesNotes, function (el) {
                    return el.username != activeUserNotes.username;
                });

                if (articlesNotes == undefined || articlesNotes == null || articlesNotes == "") {
                    articlesNotes = [];
                }

                articlesNotes.push(activeUserNotes);
                $window.localStorage.setItem("usersArticlesNotes", JSON.stringify(articlesNotes));
            }

            $scope.goBack = function () {
                $scope.isLoading = true;
                $ionicHistory.goBack();
            };

            /**
             * @function
             * @memberof controllerjs.articleCtrl
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
              * @memberof controllerjs.articleCtrl
              * @description Sets the appropriate background class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode 
              * background.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description Sets the appropriate font color class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description Sets the appropriate font style class for headers in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getNightmodeHeaderClass = function () {
                return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
            };

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description Responsible for finding the current article's notes from the local storage entry of the
              * current user.
              */
            function loadNotes() {
                if ($scope.user.isJournalist) {

                    articlesNotes = JSON.parse($window.localStorage.getItem("usersArticlesNotes"))

                    if (articlesNotes == null || articlesNotes == undefined) {
                        articlesNotes = [];
                        var currUser = {
                            username: $rootScope.activeUser.username,
                            notes: null
                        };
                        articlesNotes.push(currUser);
                    }
                    activeUserNotes = _.find(articlesNotes, function (el) {
                        return el.username == $rootScope.activeUser.username;
                    })
                    if (activeUserNotes != null || activeUserNotes != undefined) {

                        if (activeUserNotes.username == undefined || activeUserNotes.username == null)
                            activeUserNotes.username = $rootScope.activeUser.username;
                        if (activeUserNotes.notes == null || activeUserNotes.notes == undefined) {
                            activeUserNotes.notes = [];
                        }

                        $scope.currentNotes = _.find(activeUserNotes.notes, function (el) {
                            return el.id == $scope.article.Id;
                        })
                        if ($scope.currentNotes == undefined || $scope.currentNotes == null) {
                            $scope.currentNotes = {
                                id: $scope.article.Id,
                                note: ""
                            };
                        }
                        activeUserNotes.notes.push($scope.currentNotes);
                    }

                    if ($scope.currentNotes == undefined || $scope.currentNotes == null) {
                        $scope.currentNotes = {
                            id: $scope.article.Id,
                            note: ""
                        };
                    }
                }
            }

            function applyContentFiltering() {
                var tempStr = $scope.article.Content;
                var tempComment;
                $scope.article.NegativeWords.forEach(el => {
                    if (el != "***") {
                        if (data.markupEnabled) {
                            tempStr = tempStr.replace(new RegExp(el, "gi"), "<span style='background-color:yellow'>$&</span>");

                            $scope.article.comments.forEach(c => {
                                tempComment = c;
                                c.Content = c.Content.replace(new RegExp(el, "gi"), "<span style='background-color:yellow'>$&</span>");
                            })
                        } else if (data.hideEnabled) {
                            tempStr = tempStr.replace(new RegExp(el, "gi"), "<span style='display:none'>$&</span>[...]");

                            $scope.article.comments.forEach(c => {
                                tempComment = c;
                                c.Content = c.Content.replace(new RegExp(el, "gi"), "<span style='display:none'>$&</span>[...]");
                            })
                        }
                    }
                });

                $scope.article.comments.forEach(el => {
                    el.Content = $sce.trustAsHtml(el.Content.toString());
                });
                $scope.article.filteredContent = $sce.trustAsHtml(tempStr);
            }

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description Responsible for loading all the necessary data from the local storage for the current user.
              */
            function getNecessaryData() {

                usersSavedArticles = JSON.parse($window.localStorage.getItem("usersSavedArticles"));
                $scope.savedArticles = _.find(usersSavedArticles, function (usa) {
                    return usa.username == $rootScope.activeUser.username;
                });

                usersDeletedArticles = JSON.parse($window.localStorage.getItem("usersDeletedArticles"));

                $scope.deletedArticles = _.find(usersDeletedArticles, function (uda) {
                    return uda.username == $rootScope.activeUser.username;
                });

                usersReportedArticles = JSON.parse($window.localStorage.getItem("usersReportedArticles"));

                $scope.reportedArticles = _.find(usersReportedArticles, function (ura) {
                    return ura.username == $rootScope.activeUser.username;
                });

                var usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));

                var currentUserSettings = _.find(usersSettings, function (userSettings) {
                    return userSettings.username == $rootScope.activeUser.username;
                });
                data = {
                    fontsize: currentUserSettings.settings.fontsize,
                    markupEnabled: currentUserSettings.settings.markupEnabled,
                    hideEnabled: currentUserSettings.settings.hideEnabled,
                    tolerance: currentUserSettings.settings.tolerance,
                };
            }

            $ionicPopover.fromTemplateUrl('popover.html', {
                scope: $scope,
                hardwareBackButtonClose: true,
                backdropClickToClose: true
            }).then(function (popover) {
                $scope.popover = popover;
            });

            $scope.openPopover = function ($event) {
                $scope.popover.show($event);
            };

            $scope.closePopover = function () {
                $scope.popover.hide();
            };

            //Cleanup the popover when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.popover.remove();
            });

            // Execute action on hide popover
            $scope.$on('popover.hidden', function () {
                // Execute action
            });

            // Execute action on remove popover
            $scope.$on('popover.removed', function () {
                // Execute action
            });

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description Responsible for calling all the functions and executing necessary functionalities 
              * once the page is loaded.
              * Such functionalities include: 
              * 1) If the article was opened from the saved page, then the article is loaded from the user's saved 
              * articles in the local storage. If the article was opened from the news feed and there is internet connection
              * then an http request is sent to the server with the article's id in order to retrieve the article's data. If
              * the article was opened from the news feed and there is no internet connection then it is loaded from the user's
              * cached articles in the local storage. 
              * 2) Loading the notes of the article.
              */
            function init() {
                $scope.user = $rootScope.activeUser;
                if ($ionicHistory.backView().stateId == "eyeReader.savedArticles") {
                    articles = JSON.parse($window.localStorage.getItem("usersSavedArticles"));

                    articles = _.find(articles, function (art) {
                        return art.username == $rootScope.activeUser.username;
                    });
                    $scope.article = _.find(articles.articles, function (art) {
                        return art.Id == $stateParams.id;
                    });

                    loadNotes();
                    getNecessaryData();
                    applyContentFiltering();
                    $scope.isLoading = false;
                } else {
                    if ($scope.isOnline) {
                        $http.get(Server.baseUrl + 'articles/' + $stateParams.id).then(function (res) {
                            $scope.article = res.data;
                            loadNotes();
                            getNecessaryData();
                            applyContentFiltering();
                            $scope.isLoading = false;
                        });
                    } else {
                        articles = JSON.parse($window.localStorage.getItem("usersArticleCache"));

                        articles = _.find(articles, function (art) {
                            return art.username == $rootScope.activeUser.username;
                        });
                        $scope.article = _.find(articles.articles, function (art) {
                            return art.Id == $stateParams.id;
                        });
                        loadNotes();
                        getNecessaryData();
                        applyContentFiltering();
                        $scope.isLoading = false;
                    }
                }
            }
        }
    ])