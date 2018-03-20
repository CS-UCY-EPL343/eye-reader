angular
    .module("app.controllers")


    /**
     * @module savedArticlesCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the saved articles view.
     */
    .controller("savedArticlesCtrl", ["$scope", "sharedProps", "$http", "$window", "$rootScope", "$ionicLoading", "ConnectionMonitor", "$notificationBar", "$ionicPopup",
        function ($scope, sharedProps, $http, $window, $rootScope, $ionicLoading, ConnectionMonitor, $notificationBar, $ionicPopup) {
            $scope.isOnline = ConnectionMonitor.isOnline();
            var data = {};
            init();
            /**
             * @name $ionic.on.savedArticlesCtrl
             * @memberof controllerjs.profileCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
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
                var articleIndex = $scope.savedArticles.findIndex(s => s.Id == id);

                $scope.savedArticles.splice(articleIndex, 1);
                $window.localStorage.setItem("savedArticles", JSON.stringify($scope.savedArticles));

                showRemovedToast();
            }


            /**
              * @function
              * @memberof controllerjs.savedArticlesCtrl
              * @description This function is responsible for displaying an informative text 
              * when the article is removed from saved.
              */
            function showRemovedToast() {
                $notificationBar.setDuration(700);
                $notificationBar.show("Article removed from saved!", $notificationBar.EYEREADERCUSTOM);
            }


            /**
              * @function
              * @memberof controllerjs.savedArticlesCtrl
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
              * @memberof controllerjs.profileCtrl
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
              */
            function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner><p>Loading articles...</p>',
                });

                $scope.savedArticles = JSON.parse($window.localStorage.getItem("savedArticles"));
                if ($scope.savedArticles == null || $scope.savedArticles == undefined) {
                    $scope.savedArticles = {};
                }
                if (sharedProps.getData("isNightmode") != undefined)
                    $scope.isNightmode = sharedProps.getData("isNightmode").value;


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