

angular
    .module("app.controllers")

    /**
     * @module addSourcesCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the add sources view.
     */
    .controller("addSourcesCtrl", ["$scope", "$http", "$window", "$rootScope", "ConnectionMonitor", "Server", "$ionicHistory",
        function ($scope, $http, $window, $rootScope, ConnectionMonitor, Server, $ionicHistory) {
            $scope.isOnline = ConnectionMonitor.isOnline();
            $scope.isLoading = true;
            $scope.currentUserSources = {};
            $scope.input = {};
            var usersSources = {};
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
                var n = JSON.parse($window.sessionStorage.getItem("isNightmode"));
                if (n != undefined)
                    $scope.isNightmode = n;
                data.fontsize = JSON.parse($window.sessionStorage.getItem("fontsize"));
                getFontSize();
            });

            /**
             * @function
             * @memberof controllerjs.addSourcesCtrl
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
              * @memberof controllerjs.addSourcesCtrl
              * @description Sets the appropriate background class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode 
              * background.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @description Sets the appropriate font color class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @param {string} sourceTitle - The title of the selected source
              * @description Selects or deselects a source. It searches the param given in the array of
              * selected sources for the current user. If the index is found then it removes the source
              * fromt he array, else it adds it. Then the newly selected sources are saved in the local
              * storage.
              */
            $scope.select_deselectSource = function (sourceTitle) {
                if ($scope.currentUserSources != null || $scope.currentUserSources != undefined) {
                    $ionicHistory.clearCache();
                    var index = $scope.currentUserSources.sources.indexOf(sourceTitle);
                    if (index > -1) {
                        deselectSource(index);
                    } else {
                        selectSource(sourceTitle);
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
              * @param {string} sourceTitle - The Title of the selected source
              * @description Adds the selected source to the array with all the current user's selected sources.
              */
            function selectSource(sourceTitle) {
                $scope.currentUserSources.sources.push(sourceTitle);
            }

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @param {int} index - The index of the deselected source
              * @description Removes the selected source from the array with all the current user's selected sources.
              */
            function deselectSource(index) {
                $scope.currentUserSources.sources.splice(index, 1);
            };

            /**
              * @function
              * @memberof controllerjs.addSourcesCtrl
              * @description Responsible for calling all the functions and executing necessary functionalities 
              * once the page is loaded.
              * Such functionalities include: 
              * 1) Loading current user's selected sources.
              * 2) Loading current user's selected font size.
              * 3) If the device is connected to the internet it fetches sources from the server and checks them if
              * they were previously selected from the user.
              */
            function init() {
                usersSources = JSON.parse($window.localStorage.getItem("usersSources"));

                $scope.currentUserSources = _.find(usersSources, function (userSources) {
                    return userSources.username == $rootScope.activeUser.username;
                });

                if ($scope.isOnline) {

                    $http.get(Server.baseUrl + "sources/").then(function (res) {
                        $scope.sources = res.data;

                        if ($scope.currentUserSources != undefined || $scope.currentUserSources != null)
                            $scope.sources.forEach(function (el) {
                                if (_.contains($scope.currentUserSources.sources, el.Title)) {
                                    el.checked = true;
                                } else {
                                    el.checked = false;
                                }
                            })
                    }).then(function () {
                        $scope.isLoading = false;
                    });
                } else {
                    $scope.isLoading = false;
                }
            }
        }
    ])