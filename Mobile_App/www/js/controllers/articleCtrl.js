angular
    .module("app.controllers")

    /**
     * @module articleCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the article view.
     */
    .controller("articleCtrl", ["$scope", "$http", "ConnectionMonitor", "$stateParams", "sharedProps", "$ionicLoading", "$rootScope", "$window", "$ionicHistory",
        function ($scope, $http, ConnectionMonitor, $stateParams, sharedProps, $ionicLoading, $rootScope, $window, $ionicHistory) {
            var data = {};
            var isOnline = ConnectionMonitor.isOnline();
            var articles = [];

            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.articleCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                if (sharedProps.getData("isNightmode") != undefined)
                    $scope.isNightmode = sharedProps.getData("isNightmode").value;
                getFontSize();
            });

            init();

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
                $window.localStorage.setItem("articlesNotes", JSON.stringify(articlesNotes));
            }

            $scope.goBack = function () {
                $ionicHistory.goBack();
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

                    articlesNotes = JSON.parse($window.localStorage.getItem("articlesNotes"))

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

            /**
              * @function
              * @memberof controllerjs.articleCtrl
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
              */
            function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner>',
                });
                $scope.user = $rootScope.activeUser;
                //TODO http request if online
                // local storage access if online
                if ($ionicHistory.backView().stateId == "eyeReader.savedArticles") {
                    articles = JSON.parse($window.localStorage.getItem("usersSavedArticles"));

                    articles = _.find(articles, function (art) {
                        return art.username == $rootScope.activeUser.username;
                    });
                    $scope.article = _.find(articles.articles, function (art) {
                        return art.Id == $stateParams.id;
                    });
                    loadNotes();
                } else {
                    if (isOnline) {
                        //TODO HTTP REQUEST
                        $http.get("./test_data/articles/templateArticle.js").then(function (res) {
                            articles = res.data;
                        }).then(function () {
                            $scope.article = _.find(articles, function (art) {
                                return art.Id == $stateParams.id;
                            });
                            loadNotes();
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

                $ionicLoading.hide();
            }
        }
    ])