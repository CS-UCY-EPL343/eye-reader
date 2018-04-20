angular
    .module("app.controllers")

    /**
     * @module articleCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the article view.
     */
    .controller("articleCtrl", ["$scope", "$sce", "$http", "Server", "ConnectionMonitor", "$stateParams", "$rootScope",
        "$window", "$ionicHistory", "$notificationBar", "$ionicPopup", "$ionicPopover", "$state",
        function ($scope, $sce, $http, Server, ConnectionMonitor, $stateParams, $rootScope, $window, $ionicHistory, $notificationBar, $ionicPopup, $ionicPopover, $state) {
            var data = {};
            $scope.isOnline = ConnectionMonitor.isOnline();
            var articles = [];
            $scope.isLoading = true;
            $scope.checkboxes = {};
            var usersSavedArticles = [];
            var usersDeletedArticles = [];
            var usersReportedArticles = [];

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
                getFontSize();
            });

            init();

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description This function is responsible for displaying the popup when a user wants to report 
              * an article. The popup is ionic's default and uses the reportArticle.html temlpate.
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
                                $notificationBar.setDuration(1000);
                                $notificationBar.show("Article reported!", $notificationBar.EYEREADERCUSTOM);

                                $scope.reportedArticles.articles.push($scope.article.Id);

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
              * @memberof controllerjs.newsFeedCtrl
              * @param {int} id - The id of the article to check
              * @description This function is responsible for checking if the article given is saved or not.
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
              * @description This function is responsible for deciding wether to add an article to saved 
              * or remove an article from saved. Firstly, it checks if the article is saved. If it is then 
              * it is removed from saved and displays an informative message. Else it adds the article to 
              * saved and displays an informative message.
              */
            $scope.save_unsaveArticle = function () {
                if ($scope.isArticleSaved()) {
                    unsaveArticle();
                    showRemovedToast();
                    return;
                }
                saveArticle();
                showSavedToast();
            };

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @param {int} id - The id of the article to save
              * @description This function is responsible for adding the article to the saved articles.
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
              * @param {int} id - The id of the article to check
              * @description This function is responsible for checking if the article given is saved or not.
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
              * @description This function is responsible for deleting an article from the news feed. Firstly 
              * it finds the article in the list of articles and then it splices the array of articles in order 
              * to remove it and then it saves tha article in a json with all the deleted articles in order
              * to be able not to display it in the news feed.
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
             * @description Function that checks if an article id is included in the deleted articles array.
             * If it is, then its not displayed on the html.
             */
            $scope.isDeleted = function () {
                if ($scope.isLoading)
                    return;
                return $scope.deletedArticles.articles.includes($scope.article.Id);
            }

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description This function is responsible for displaying a popup in order to warn the user 
              * that they are about to delete an article. If the user clicks "Confirm" then the article is deleted 
              * and the popup is closed. If the user clicks "Cancel" then the article is not removed and the 
              * popup is closed.
              */
            $scope.showDeleteConfirm = function () {
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
                            deleteArticle();
                            showDeletedToast();
                        }
                    }
                    ]
                });
            };

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description This function is responsible for displaying an informative text that the selected article 
              * was deleted from the feed.
              */
            function showDeletedToast() {
                $notificationBar.setDuration(1000);
                $notificationBar.show("Article deleted!", $notificationBar.EYEREADERCUSTOM);
            }

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @param {int} id - The id of the article to unsave
              * @description This function is responsible for finding the selected article and remove it from 
              * the array with the saved articles by splicing the array on the article's position.
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
              * @description This function is responsible for displaying an informative text 
              * when the article is saved.
              */
            function showSavedToast() {
                $notificationBar.setDuration(1000);
                $notificationBar.show("Article added to saved!", $notificationBar.EYEREADERCUSTOM);
            }

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description This function is responsible for displaying an informative text 
              * when the article is removed from saved.
              */
            function showRemovedToast() {
                $notificationBar.setDuration(1000);
                $notificationBar.show("Article removed from saved!", $notificationBar.EYEREADERCUSTOM);
            }


            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description Saves the written notes to the device's local storage
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
                $state.go("eyeReader.newsFeed");
            };

            /**
             * @function
             * @memberof controllerjs.articleCtrl
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
              * @memberof controllerjs.articleCtrl
              * @description This function is responsible for retrieving the class used in the background
              * in order to set the background to nightmode/lightmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description This function is responsible for retrieving the class used in the header  
              * in order to set the header to nightmode/lightmode.
              */
            $scope.getNightmodeHeaderClass = function () {
                return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
            };

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

            function applyMandolaFiltering() {
                //TODO: USE THIS TO CHANGE STUFF FOR MANDOLA
                // var temp = $scope.article.Content.toString().replace("/smartphones/g","<span style='background-color:yellow'>smartphones</span>");
                // var temp = $scope.article.Content.toString().replace("/smartphones/g","<span style='display:none'>smartphones</span>");
                // $scope.article.Content = $sce.trustAsHtml(temp);
                var tempStr = $scope.article.Content;
                $scope.article.NegativeWords.forEach(el => {
                    if (data.markupEnabled) {
                        tempStr = $scope.article.Content.toString().replace("/" + el + "/g", "<span style='background-color:yellow'>" + el + "</span>");
                    } else if (data.hideEnabled) {
                        tempStr = $scope.article.Content.toString().replace("/" + el + "/g", "<span style='display:none'>" + el + "</span>");
                    }
                });
                $scope.article.newContent = $sce.trustAsHtml(tempStr);
            }

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
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
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
                    applyMandolaFiltering();
                    getNecessaryData();
                    $scope.isLoading = false;
                } else {
                    if ($scope.isOnline) {
                        $http.get(Server.baseUrl + 'articles/' + $stateParams.id).then(function (res) {
                            $scope.article = res.data;
                            loadNotes();
                            applyMandolaFiltering();

                            getNecessaryData();
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
                        applyMandolaFiltering();
                        getNecessaryData();
                        $scope.isLoading = false;
                    }
                }
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

            }
        }
    ])