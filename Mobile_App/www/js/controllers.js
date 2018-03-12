angular
    .module("app.controllers", ["ngCordova", "ngStorage", "chart.js", "ngAnimate", "ionic-notification-bar"])
    /**
     * @module controllerjs
     * @description Default module create by Ionic v1 and AngularJS for controlling the views in the app.
     */

    /**
     * @module newsFeedCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the News Feed page.
     */
    .controller("newsFeedCtrl", ["$scope", "$http", "$stateParams", "sharedProps", "$ionicPopup",
        "$ionicActionSheet", "$timeout", "$localStorage", "$sessionStorage", "$ionicLoading", "$window",
        "$notificationBar",
        function ($scope, $http, $stateParams, sharedProps, $ionicPopup, $ionicActionSheet,
            $timeout, $localStorage, $sessionStorage, $ionicLoading, $window, $notificationBar) {
            init();

            //currently selected sources
            $scope.sources = {
                total: 2
            };

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
                var f = sharedProps.getData("fontsize");
                if (f != undefined)
                    $scope.selectedFontsizeVal = f.value;
                else
                    $scope.selectedFontsizeVal = 100;

                //font size for normal letters
                $scope.fontsize = { 'font-size': $scope.selectedFontsizeVal + '%' }
                //font size for smaller letters than the normal ones
                $scope.fontsizeSmaller = { 'font-size': ($scope.selectedFontsizeVal - 20) + '%' }
            }

            /**
              * @function
              * @memberof controllerjs.newsFeedCtrl
              * @description This function is responsible for displaying the popup when a user wants to report 
              * an article. The popup is ionic's default and uses the reportTemplate.html temlpate.
              */
            $scope.showReportOptions = function () {
                var promptAlert = $ionicPopup.show({
                    title: "Report",
                    templateUrl: "templates/reportTemplate.html",
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
                        onTap: function (e) { }
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
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
              */
            function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner>',
                });
                // $http.get("https://eye-reader.herokuapp.com/articles/").then(function(res){
                //     $scope.articles = res.data;
                //     $ionicLoading.hide();
                // });

                /**
                 * @name $http.get
                 * @memberof controllerjs.newsFeedCtrl
                 * @description Executes a request to the application's server in order to retrieve the articles and their 
                 * details. The server's response is saved in a scope variable in order to be accessible from 
                 * the html.
                 */
                $http.get("./test_data/articles/templateArticle.js").then(function (res) {
                    $scope.articles = res.data;
                });


                $ionicLoading.hide();
            }
        }
    ])

    /**
     * @module settingsCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the Settings page.
     */
    .controller("settingsCtrl", ["$scope", "$stateParams", "$ionicPopup", "$rootScope", "sharedProps",
        "$interval", "$timeout",
        function ($scope, $stateParams, $ionicPopup, $rootScope, sharedProps, $interval, $timeout) {
            //object holding all the values in the settings page from all the toggles and range bars
            $scope.data = {
                cachenewsEnabled: sharedProps.getData("cachenewsEnabled") == undefined ?
                    false : sharedProps.getData("cachenewsEnabled").value,
                fontsize: sharedProps.getData("fontsize") == undefined ?
                    100 : sharedProps.getData("fontsize").value,
                fontsizeRange: getFontsizeRangeVal(),
                markupEnabled: sharedProps.getData("markupEnabled") == undefined ?
                    false : sharedProps.getData("markupEnabled").value,
                hideEnabled: sharedProps.getData("hideEnabled") == undefined ?
                    false : sharedProps.getData("hideEnabled").value,
                tolerance: sharedProps.getData("tolerance") == undefined ?
                    50 : sharedProps.getData("tolerance").value
            };

            /**
             * @function
             * @memberof controllerjs.settingsCtrl
             * @description This function is responsible for matching the selected value from the font size 
             * range bar to the actual font size value.
             * (font size of range bar is in pixel values and the actual font size metric used is percentage)
             */
            function getFontsizeRangeVal() {
                var f = sharedProps.getData("fontsize");
                if (f == undefined)
                    return 16;
                else {
                    if (f.value == 87.5)
                        return 14;
                    else if (f.value == 100)
                        return 16;
                    else if (f.value == 112.5)
                        return 18;
                    else
                        return 20;
                }
            }

            /**
             * @name $ionic.on.beforeLeave
             * @memberof controllerjs.settingsCtrl
             * @description Executes actions before this page leaves the view.
             *  Actions taken: 1) Adds the cache news toggle value to the shared properties space. 
             *                 2) Adds the markup toggle value to the shared properties space.
             *                 3) Adds the hide toggle value to the shared properties space.
             *                 4) Adds the tolerance range value to the shared properties space.
             */
            $scope.$on("$ionicView.beforeLeave", function () {
                sharedProps.addData("cachenewsEnabled", $scope.data.cachenewsEnabled);
                sharedProps.addData("markupEnabled", $scope.data.markupEnabled);
                sharedProps.addData("hideEnabled", $scope.data.hideEnabled);
                sharedProps.addData("tolerance", $scope.data.tolerance);
            });

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description This function is responsible for adding the value of the nightmode toggle to the 
              * shared properties space and to broadcast it to the other controllers in order for the sidemenu 
              * controller to recieve it and change it's background value according to the toggle's value.
              */
            $scope.setNightmode = function () {
                $rootScope.$broadcast("nightmodeChange", $scope.data.isNightmode);
                sharedProps.addData("isNightmode", $scope.data.isNightmode);
            };

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description This function is responsible for matching the selected value from the font size 
              * range bar to the actual font size value in order to display it in pixels in the page. 
              * (font size of range bar is in pixel values and the actual font size metric used is percentage)
              */
            $scope.$watch("data.fontsizeRange", function () {
                if ($scope.data.fontsizeRange == 14)
                    $scope.fontsize = 87.5;
                else if ($scope.data.fontsizeRange == 16)
                    $scope.fontsize = 100;
                else if ($scope.data.fontsizeRange == 18)
                    $scope.fontsize = 112.5;
                else
                    $scope.fontsize = 125;
                $scope.selectedFontsize = { 'font-size': $scope.fontsize + '%' }
                $rootScope.$broadcast('fontsizeChange', $scope.fontsize + 20);
                sharedProps.addData('fontsize', $scope.fontsize);
            });

            /**
             * @function
             * @memberof controllerjs.settingsCtrl
             * @description This function is responsible for retrieving the class used in the background
             * in order to set the background to nightmode/lightmode.
             */
            $scope.getBackgroundClass = function () {
                return $scope.data.isNightmode ?
                    "nightmodeBackgroundMain" :
                    "normalBackgroundMain";
            };

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.data.isNightmode ?
                    "nightmodeFontColor" :
                    "normalBlackLetters";
            };
        }
    ])

    /**
     * @module addSourcesCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the Add Sources page.
     */
    .controller("addSourcesCtrl", ["$scope", "$http", "$stateParams", "sharedProps", "$ionicActionSheet",
        "$timeout", "$notificationBar", "$ionicLoading",
        function ($scope, $http, $stateParams, sharedProps, $ionicActionSheet, $timeout, $notificationBar, $ionicLoading) {
            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.addSourcesCtrl
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
             * @memberof controllerjs.addSourcesCtrl
             * @description This function is responsible for retrieving the selected font size from the 
             * shared properties space and set the value into scope variables in order to be used in 
             * the page and set the page's font size.
             */
            function getFontSize() {
                var f = sharedProps.getData("fontsize");
                if (f != undefined)
                    $scope.selectedFontsizeVal = f.value;
                else
                    $scope.selectedFontsizeVal = 100;
                $scope.fontsize = { 'font-size': $scope.selectedFontsizeVal + '%' }
            }

            $scope.sources = {
                total: 0,
                sites: []
            };

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @description This function is responsible for retrieving the class used in the background
              * in order to set the background to nightmode/lightmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @param {string} sourceTitle - The title of the selected source
              * @description This function is responsible for selecting a source and displaying an 
              * informational message.
              */
            $scope.selectSource = function (sourceTitle) {
                showSuccessToast(sourceTitle);
            };

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @param {string} sourceTitle - The title of the deselected source
              * @description This function is responsible for deselecting a source and displaying an 
              * informational message.
              */
            $scope.deselectSource = function (sourceTitle) { };

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @param {string} sourceTitle - The title of the selected source
              * @description This function is responsible for selecting a source and displaying an 
              * informational message.
              */
            function showSuccessToast(sourceTitle) {
                $notificationBar.setDuration(700);
                $notificationBar.show(sourceTitle + " selected!", $notificationBar.EYEREADERCUSTOM);
            }

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @param {string} sourceTitle - The name of the source that was saved/unsaved
              * @description This function is responsible for displaying an informational message about failing 
              * to selected the given source.
              */
            function showFailureToast(sourceTitle) {

                $notificationBar.setDuration(700);
                $notificationBar.show("Failed to select " + sourceTitle + "!", $notificationBar.EYEREADERCUSTOM);
            }

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
              */
            function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner>',
                });

                /**
                 * @name $http.get
                 * @memberof controllerjs.addSourcesCtrl
                 * @description Executes a request to the application's server in order to retrieve the sources and their 
                 * details. The server's response is saved in a scope variable in order to be accessible from 
                 * the html.
                 */
                $http.get("https://eye-reader.herokuapp.com/sources/").then(function (res) {
                    $scope.sources.sites = res.data;
                });

                // $http.get("./test_data/sources.js").then(function (res) {
                //     $scope.sources.sites = res.data;
                //     $scope.sources.total = $scope.sources.sites.length;
                // }); 
                $ionicLoading.hide();
            }
        }
    ])

    /**
     * @module eyeReaderCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the Side menu.
     */
    .controller("eyeReaderCtrl", ["$scope", "$stateParams", "$rootScope", "sharedProps", "$ionicPopup",
        "$state", "AuthenticationService",
        function ($scope, $stateParams, $rootScope, sharedProps, $ionicPopup, $state, AuthenticationService) {
            //the currently active user
            $scope.currUser = $rootScope.globals.currentUser.username;

            /**
             * @name $rootScope.$on.usernameChange
             * @memberof controllerjs.newsFeedCtrl
             * @description Executes actions when the message "usernameChange" is broadcasted in the controllers.
             *  Actions taken: 1) Gets the new username of the currently active user.
             */
            $rootScope.$on("usernameChange", function (event, args) {
                $scope.currUser = $rootScope.globals.currentUser.username;
            });

            /**
             * @name $rootScope.$on.nightmodeChange
             * @memberof controllerjs.newsFeedCtrl
             * @description Executes actions when the message "nightmodeChange" is broadcasted in the controllers.
             *  Actions taken: 1) Gets the new value of the nightmode toggle that was set in the settings page.
             */
            $rootScope.$on("nightmodeChange", function (event, args) {
                $scope.isNightmode = args;
            });

            /**
             * @name $rootScope.$on.fontsizeChange
             * @memberof controllerjs.newsFeedCtrl
             * @description Executes actions when the message "fontsizeChange" is broadcasted in the controllers.
             *  Actions taken: 1) Gets the new value of the font size that was set in the settings page.
             */
            $rootScope.$on("fontsizeChange", function (event, args) {
                $scope.selectedFontsize = { 'font-size': args + '%' };
            });

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description This function is responsible for retrieving the class used in the background
              * in order to set the background to nightmode/lightmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalBackground";
            };

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description This function is responsible for retrieving the class used as the sidemenu 
              * icons class in order to set the icon style to nightmode/lightmode.
              */
            $scope.getSidemenuIconClass = function () {
                return $scope.isNightmode ? "nightmodeSidemenuIcon" : "normalSidemenuIcon";
            };

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description This function is responsible for retrieving the class used in the header  
              * in order to set the header to nightmode/lightmode.
              */
            $scope.getNightmodeHeaderClass = function () {
                return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
            };

            /**
              * @function
              * @memberof controllerjs.eyeReaderCtrl
              * @description This function is responsible for displaying a warning popup that warns the user 
              * that they are about to logout. If the user selects "Confirm" then the popup closes and the 
              * user is logged out. Else if the user selects "Cancel" the popup closes.
              */
            $scope.logout = function () {
                var promptAlert = $ionicPopup.show({
                    title: "Warning",
                    template: '<span>Are you sure you want to <strong>logout</strong>?</span>',
                    buttons: [{
                        text: "Cancel",
                        type: "button-stable button-outline",
                        onTap: function (e) { }
                    }, {
                        text: "Confirm",
                        type: "button-positive",
                        onTap: function (e) {
                            AuthenticationService.ClearCredentials();
                            $state.go("login");
                        }
                    }]
                });
            };
        }
    ])

    /**
     * @module profileCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the profile view.
     */
    .controller("profileCtrl", ["$scope", "$rootScope", "$stateParams", "sharedProps",
        function ($scope, $rootScope, $stateParams, sharedProps) {
            //gets the currently active user
            $scope.user = $rootScope.activeUser;
            //sets the value of the user's sex based on their decision
            if ($scope.user.sex == 0)
                $scope.displaySex = "Female";
            else if ($scope.user.sex == 1)
                $scope.displaySex = "Male";
            else
                $scope.displaySex = "Other";

            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.profileCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                if (sharedProps.getData("isNightmode") != undefined) {
                    $scope.isNightmode = sharedProps.getData("isNightmode").value;
                }
                getFontSize();
            });

            /**
             * @function
             * @memberof controllerjs.profileCtrl
             * @description This function is responsible for retrieving the selected font size from the 
             * shared properties space and set the value into scope variables in order to be used in 
             * the page and set the page's font size.
             */
            function getFontSize() {
                var f = sharedProps.getData("fontsize");
                if (f != undefined)
                    $scope.selectedFontsizeVal = f.value;
                else
                    $scope.selectedFontsizeVal = 100;

                $scope.fontsize = { 'font-size': $scope.selectedFontsizeVal + '%' }
            }

            /**
              * @function
              * @memberof controllerjs.profileCtrl
              * @description This function is responsible for retrieving the class used in the background
              * in order to set the background to nightmode/lightmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalBackground";
            };

            /**
              * @function
              * @memberof controllerjs.profileCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };
        }
    ])

    /**
     * @module editProfileCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the edit profile view.
     */
    .controller("editProfileCtrl", ["$scope", "$rootScope", "$stateParams", "sharedProps", "$timeout",
        "$state", "UserService", "$ionicLoading",
        function ($scope, $rootScope, $stateParams, sharedProps, $timeout, $state, UserService, $ionicLoading) {
            init();

            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.editProfileCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                if (sharedProps.getData("isNightmode") != undefined)
                    $scope.isNightmode = sharedProps.getData("isNightmode").value;
                getFontSize();
            });

            /**
             * @function
             * @memberof controllerjs.editProfileCtrl
             * @description This function is responsible for retrieving the selected font size from the 
             * shared properties space and set the value into scope variables in order to be used in 
             * the page and set the page's font size.
             */
            function getFontSize() {
                var f = sharedProps.getData("fontsize");
                if (f != undefined)
                    $scope.selectedFontsizeVal = f.value;
                else
                    $scope.selectedFontsizeVal = 100;
                $scope.fontsize = { 'font-size': $scope.selectedFontsizeVal + '%' }
            }

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description This function is responsible for retrieving the class used in the background
              * in order to set the background to nightmode/lightmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description This function is responsible for sending the new values of the newly edited profile 
              * to be saved in the device's local storage, broadcasts the new username value for the sidemenu to 
              * get and display and changes from the current page to the profile page.
              */
            $scope.editProfile = function () {
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

            /**
              * @function
              * @memberof controllerjs.editProfileCtrl
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
              */
             function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner>',
                });

                //sets the value of the user's sex based on their decision
                $scope.sexOptions = [
                    { name: "Female", id: 0 },
                    { name: "Male", id: 1 },
                    { name: "Other", id: 2 }
                ];
                //sets the name of the currently active user
                $scope.user = $rootScope.activeUser;
                //creates a new objects with the current user details
                $scope.editedUser = $scope.user;
                $scope.selectedSex = $scope.editedUser.sex;
                $scope.editedUser.birthday = new Date($scope.editedUser.birthday);

                $ionicLoading.hide();
            }
        }
    ])

    /**
     * @module signupCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the edit sign up view.
     */
    .controller("signupCtrl", ["$scope", "$stateParams", "sharedProps", "UserService", "$window",
        "$state", "$ionicPopup", "$ionicLoading",
        function ($scope, $stateParams, sharedProps, UserService, $window, $state, $ionicPopup, $ionicLoading) {
            init();

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
                        $state.go("login");
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
            
            /**
            * @function
            * @memberof controllerjs.signupCtrl
            * @description This function is responsible for calling all the functions that need to 
            * be executed when the page is initialized.
            */
          function init() {
              $ionicLoading.show({
                  template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner>',
              });
                //$window.localStorage.clear();
                //creates ojects for the new user's profile
                $scope.user = {};
                $scope.sexOptions = [{ name: "Female", id: 0 }, { name: "Male", id: 1 }, { name: "Other", id: 2 }];
                $scope.user.sex = 0;
                $scope.user.birthday = new Date();
                $scope.user.firstTime = true;
            }
        }
    ])

    /**
     * @module loginCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the edit login view.
     */
    .controller("loginCtrl", ["$scope", "$stateParams", "sharedProps", "$location", "AuthenticationService",
        "$state", "$window", "$ionicPopup", "$ionicActionSheet", "$timeout", "$ionicLoading",
        function ($scope, $stateParams, sharedProps, $location, AuthenticationService, $state, $window,
            $ionicPopup, $ionicActionSheet, $timeout, $ionicLoading) {

            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description This function is responsible for creating new values in the shared properties 
              * space for the new user's settings.
              */
            function createUserSettings() {
                sharedProps.addData("isNightmode", false);
                sharedProps.addData("cachenewsEnabled", false);
                sharedProps.addData("fontsize", 100);
                sharedProps.addData("markupEnabled", false);
                sharedProps.addData("hideEnabled", false);
                sharedProps.addData("tolerance", 50);
            }

            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description This function is responsible for finding the logged in user's settings from 
              * the local storage and save them to shared properties space.
              */
            function loadUserSettings() {
                var usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));

                var currentUserSettings = _.find(usersSettings, function (userSettings) {
                    userSettings.username == $scope.login.username;
                });
                sharedProps.addData("isNightmode", currentUserSettings.isNightmode);
                sharedProps.addData("cachenewsEnabled", currentUserSettings.cachenewsEnabled);
                sharedProps.addData("fontsize", currentUserSettings.fontsize);
                sharedProps.addData("markupEnabled", currentUserSettings.markupEnabled);
                sharedProps.addData("hideEnabled", currentUserSettings.hideEnabled);
                sharedProps.addData("tolerance", currentUserSettings.tolerance);
            }

            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description This function is responsible for displaying an informative message if there was 
              * a problem with the user logging in the app.
              */
            function showFailedToLoginPopup(resp) {
                var promptAlert = $ionicPopup.show({
                    title: "Error",
                    template: '<span>Failed to login! ' + resp.message + '.</span>',
                    buttons: [{
                        text: "OK",
                        type: "button-positive",
                        onTap: function (e) { }
                    }]
                });
            };

            /**
              * @function
              * @memberof controllerjs.loginCtrl
              * @description This function is responsible for requesting from the authentication service to 
              * login the user in the app. If the service replies with success, then the view is transfered to 
              * the news feed view. Else an informative message is displayed.
              */
            $scope.login = function () {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner>',
                });
                AuthenticationService.Login(
                    $scope.login.username,
                    $scope.login.password,
                    function (response) {
                        if (response.success) {
                            AuthenticationService.SetCredentials(
                                $scope.login.username,
                                $scope.login.password
                            );
                            createUserSettings();
                            //TODO: REMOVE COMMENT FROM CODE TO CHECK IN APP IF SETTINGS ARE PRESERVED
                            // if (response.firstTime)
                            //     createUserSettings();
                            // else
                            //     loadUserSettings();
                            $ionicLoading.hide();
                            $state.go("eyeReader.newsFeed");
                        } else {
                            showFailedToLoginPopup(response);
                        }
                    }
                );
            };
        }
    ])

    /**
     * @module articleCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the article view.
     */
    .controller("articleCtrl", ["$scope", "$stateParams", "sharedProps", "$ionicLoading",
        function ($scope, $stateParams, sharedProps, $ionicLoading) {

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
             * @description This function is responsible for retrieving the selected font size from the 
             * shared properties space and set the value into scope variables in order to be used in 
             * the page and set the page's font size.
             */
            function getFontSize() {
                var f = sharedProps.getData("fontsize");
                if (f != undefined)
                    $scope.selectedFontsizeVal = f.value;
                else
                    $scope.selectedFontsizeVal = 100;

                $scope.fontsize = { 'font-size': ($scope.selectedFontsizeVal) + '%' }
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

                $scope.article = $stateParams.article;

                $ionicLoading.hide();
            }
        }
    ])

    /**
     * @module savedArticlesCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the saved articles view.
     */
    .controller("savedArticlesCtrl", ["$scope", "$stateParams", "sharedProps", "$http", "$window",
        function ($scope, $stateParams, sharedProps, $http, $window) {

            /**
             * @name $ionic.on.savedArticlesCtrl
             * @memberof controllerjs.profileCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                var temp = $window.localStorage.getItem("savedArticles");
                // var temp = sharedProps.getData("savedArticles");
                if (temp)
                    $scope.savedArticles = JSON.parse(temp);
                else
                    $scope.savedArticles = [];
                if (sharedProps.getData("isNightmode") != undefined)
                    $scope.isNightmode = sharedProps.getData("isNightmode").value;

                getFontSize();
            });


            /**
             * @function
             * @memberof controllerjs.profileCtrl
             * @description This function is responsible for retrieving the selected font size from the 
             * shared properties space and set the value into scope variables in order to be used in 
             * the page and set the page's font size.
             */
            function getFontSize() {
                var f = sharedProps.getData("fontsize");
                if (f != undefined)
                    $scope.selectedFontsizeVal = f.value;
                else
                    $scope.selectedFontsizeVal = 100;

                $scope.fontsize = { 'font-size': $scope.selectedFontsizeVal + '%' }
                $scope.fontsizeSmaller = { 'font-size': ($scope.selectedFontsizeVal - 20) + '%' }
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
        }
    ])

    /**
     * @module statisticsCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the statistics view.
     */
    .controller("statisticsCtrl", ["$scope", "$stateParams", "sharedProps", "$timeout", "$ionicLoading",
        function ($scope, $stateParams, sharedProps, $timeout, $ionicLoading) {

            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.statisticsCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                if (sharedProps.getData("isNightmode") != undefined) {
                    $scope.isNightmode = sharedProps.getData("isNightmode").value;
                }
                getFontSize();
            });

            init();

            /**
             * @function
             * @memberof controllerjs.statisticsCtrl
             * @description This function is responsible for retrieving the selected font size from the 
             * shared properties space and set the value into scope variables in order to be used in 
             * the page and set the page's font size.
             */
            function getFontSize() {
                var f = sharedProps.getData("fontsize");
                if (f != undefined)
                    $scope.selectedFontsizeVal = f.value;
                else
                    $scope.selectedFontsizeVal = 100;
                $scope.fontsize = { 'font-size': $scope.selectedFontsizeVal + '%' }
                $scope.fontsizeSmaller = { 'font-size': ($scope.selectedFontsizeVal - 20) + '%' }
            }

            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description This function is responsible for retrieving the class used in the background
              * in order to set the background to nightmode/lightmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description This function is responsible for retrieving the class used in the header  
              * in order to set the header to nightmode/lightmode.
              */
            $scope.getNightmodeHeaderClass = function () {
                return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
            };


            $scope.selectSource = [{ name: "All Sources", id: 0 }, { name: "Source x", id: 1 }, { name: "Source y", id: 2 }];
            $scope.viewStatistics = [{ name: "Report", id: 0 }, { name: "Hate Speech", id: 1 }, { name: "Sentiment Analysis", id: 2 }];
            $scope.selectedStatistic = 0;
            $scope.selectedSource = 0;

            $scope.barLbls = ["January", "February", "March", "April", "May"];
            $scope.series = ['Series A'];
            $scope.barData = [
                [65, 59, 80, 81, 56]
            ];

            $scope.doughnutLbls = ["January", "February"];
            $scope.series = ['Series A'];
            $scope.doughnutData = [
                [65, 59]
            ];

            // Simulate async data update
            $timeout(function () {
                $scope.data = [
                    [28, 48, 40, 19, 86]
                ];
            }, 3000);
            
            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
              */
             function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner>',
                });
                

                $ionicLoading.hide();
            }
        }
    ])

    /**
     * @module reportArticleCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the report article template.
     */
    .controller("reportArticleCtrl", ["$scope", "$stateParams", "sharedProps",
        function ($scope, $stateParams, sharedProps) {

            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.reportArticleCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                if (sharedProps.getData("isNightmode") != undefined)
                    $scope.isNightmode = sharedProps.getData("isNightmode").value;
            });

            /**
              * @function
              * @memberof controllerjs.reportArticleCtrl
              * @description This function is responsible for retrieving the class used in the background
              * in order to set the background to nightmode/lightmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };
        }
    ]);