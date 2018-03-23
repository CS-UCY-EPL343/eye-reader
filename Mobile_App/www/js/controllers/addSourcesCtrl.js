

angular
    .module("app.controllers")

    /**
     * @module addSourcesCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the Add Sources page.
     */
    .controller("addSourcesCtrl", ["$scope", "$http", "sharedProps",
        "$ionicLoading", "$window", "$rootScope", "$ionicSideMenuDelegate",
        function ($scope, $http, sharedProps, $ionicLoading, $window, $rootScope, $ionicSideMenuDelegate) {
            var usersSources = {};
            $scope.currentUserSources = {};
            var data = {};
            init();

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

            /**
             * @function
             * @memberof controllerjs.addSourcesCtrl
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
            $scope.select_deselectSource = function (sourceURL) {
                if ($scope.currentUserSources != null || $scope.currentUserSources != undefined) {

                    var index = $scope.currentUserSources.sources.indexOf(sourceURL);
                    if (index > -1) {
                        deselectSource(sourceURL, index);
                    } else {
                        selectSource(sourceURL);
                    }
                    usersSources = _.filter(usersSources, function (userSources) {
                        return userSources.username != $rootScope.activeUser.username;
                    });
                    usersSources.push($scope.currentUserSources);

                    $window.localStorage.setItem("usersSources", JSON.stringify(usersSources));
                }
            };

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @param {string} sourceURL - The URL of the selected source
              * @description Adds the selected source to the array with all the selected sources
              */
            function selectSource(sourceURL) {
                $scope.currentUserSources.sources.push(sourceURL);
            }

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @param {string} sourceTitle - The title of the deselected source
              * @description This function is responsible for deselecting a source and displaying an 
              * informational message.
              */
            function deselectSource(sourceURL, index) {
                $scope.currentUserSources.sources.splice(index, 1);
            };

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
                usersSources = JSON.parse($window.localStorage.getItem("usersSources"));
                if (usersSources == null || usersSources == undefined) {
                    usersSources = {};
                    $scope.currentUserSources = {
                        username: $rootScope.activeUser.username,
                        sources: []
                    };
                } else {
                    $scope.currentUserSources = _.find(usersSources, function (userSources) {
                        return userSources.username == $rootScope.activeUser.username;
                    });

                    if ($scope.currentUserSources == null || $scope.currentUserSources == undefined) {
                        $scope.currentUserSources = {
                            username: $rootScope.activeUser.username,
                            sources: []
                        };
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

                $http.get("https://eye-reader.herokuapp.com/sources/").then(function (res) {
                    $scope.sources = res.data;

                    if ($scope.currentUserSources != undefined || $scope.currentUserSources != null)
                        $scope.sources.forEach(function (el) {
                            if (_.contains($scope.currentUserSources.sources, el.URL)) {
                                el.checked = true;
                            } else {
                                el.checked = false;
                            }
                        })
                }).then(function () {
                    $ionicLoading.hide();
                });
            }
        }
    ])