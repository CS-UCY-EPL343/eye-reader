
angular
    .module("app.controllers")

    /**
     * @module settingsCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the settings view.
     */
    .controller("settingsCtrl", ["$scope", "$rootScope", "$window", "$ionicSideMenuDelegate", "$ionicPopup", "$state", "$q", "Server", "$http", "ConnectionMonitor",
        function ($scope, $rootScope, $window, $ionicSideMenuDelegate, $ionicPopup, $state, $q, Server, $http, ConnectionMonitor) {
            $scope.isOnline = ConnectionMonitor.isOnline();
            const _ArticlesToCache = 10;
            var usersSettings = {};
            var currentUserSettings = {};
            var tempSettings = {};
            var networkAlert;
            var usersArticleCache;
            var cachedArticles = [];
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
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description Responsible for saving the new settings under the user's entry in the local storage.
              * Also it saved in the session storage the font size used for easier font management across pages.
              */
            function saveUserSettings() {
                $window.sessionStorage.setItem("isNightmode", JSON.stringify($scope.data.isNightmode));

                currentUserSettings.settings.cachenewsEnabled = $scope.data.cachenewsEnabled;
                currentUserSettings.settings.fontsize = $scope.fontsize;
                currentUserSettings.settings.fontsizeRange = $scope.data.fontsizeRange;
                currentUserSettings.settings.markupEnabled = $scope.data.markupEnabled;
                currentUserSettings.settings.hideEnabled = $scope.data.hideEnabled;
                currentUserSettings.settings.tolerance = $scope.data.tolerance;

                usersSettings = _.filter(usersSettings, function (us) {
                    return us.username != currentUserSettings.username;
                });

                usersSettings.push(currentUserSettings);
                $window.localStorage.setItem("usersSettings", JSON.stringify(usersSettings));
                $window.sessionStorage.setItem("fontsize", JSON.stringify(currentUserSettings.settings.fontsize));
            }

            $scope.$on('$ionicView.beforeLeave', function () {
                saveUserSettings();
            });

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description Responsible for broadcasting across the application the value of the nightmode toggle.
              * Also it saves the value of the nightmode in the session storage for easier background class management
              * across the pages.
              */
            $scope.setNightmode = function () {
                $rootScope.$broadcast("nightmodeChange", $scope.data.isNightmode);
                $window.sessionStorage.setItem("isNightmode", JSON.stringify($scope.data.isNightmode));
            };

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description Responsible for matching the value of the font size range bar to the appropriate font size
              * percentage used. Also it broadcasts the changed value across the app.
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
            });

            /**
             * @function
             * @memberof controllerjs.settingsCtrl
              * @description Sets the appropriate background class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode 
              * background.
             */
            $scope.getBackgroundClass = function () {
                return $scope.data.isNightmode ?
                    "nightmodeBackgroundMain" :
                    "normalBackgroundMain";
            };

            /**
              * @function
              * @memberof controllerjs.settingsCtrl
              * @description Sets the appropriate font color class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getFontClass = function () {
                return $scope.data.isNightmode ?
                    "nightmodeFontColor" :
                    "normalBlackLetters";
            };

            $scope.checkCache = function () {
                $scope.isLoading = true;
                if (!$scope.data.cachenewsEnabled) {
                    usersArticleCache = _.filter(usersArticleCache, function (ac) {
                        return ac.username != $rootScope.activeUser.username;
                    });
                    $window.localStorage.setItem("usersArticleCache", JSON.stringify(usersArticleCache));
                } else {
                    var usersSources = JSON.parse($window.localStorage.getItem("usersSources"));

                    var selectedSources = _.find(usersSources, function (userSources) {
                        return userSources.username == $rootScope.activeUser.username;
                    });
                    if ($scope.isOnline && selectedSources.sources.length > 0) {
                        var usersDeletedArticles = JSON.parse($window.localStorage.getItem("usersDeletedArticles"));
                        
                        var deletedArticles = _.find(usersDeletedArticles, function (uda) {
                            return uda.username == $rootScope.activeUser.username;
                        });

                        var requests = [];
                        var article_resp = [];
                        for (var i = 0; i < selectedSources.sources.length; i++) {
                            requests.push($http.get(Server.baseUrl + 'articles/from/' + selectedSources.sources[i]));
                        }
                        $q.all(requests).then(function (res) {
                            res.forEach(el => {
                                if (Array.isArray(el.data)) {
                                    el.data.forEach(d => {
                                        if (!_.contains(deletedArticles.articles, d.Id)) {
                                            article_resp.push(d);
                                        }
                                    });
                                }
                            });
                            for (var i = 0; i < article_resp.length; i++) {
                                if (i < _ArticlesToCache) {
                                    cachedArticles.push(article_resp[i]);
                                }
                            }
                            cacheArticles();

                            saveUserSettings();

                            $scope.isLoading = false;
                        }).catch(function (error) {
                            $ionicPopup.alert({
                                title: "ERROR",
                                template: "<span>An error has occured! Cannot cache articles!</span>",
                            });
                            $scope.isLoading = false;
                        });
                    }
                }
            };

            function cacheArticles() {
                var articleCache = _.filter(articleCache, function (ac) {
                    return ac.username != $rootScope.activeUser.username;
                });

                var cached = {
                    username: $rootScope.activeUser.username,
                    articles: cachedArticles
                };

                articleCache.push(cached);

                $window.localStorage.setItem("usersArticleCache", JSON.stringify(articleCache));
            }

            $scope.updateSettings = function(){
                saveUserSettings();
            }

            /**
             * @function
          * @memberof controllerjs.settingsCtrl
          * @description Responsible for calling all the functions and executing necessary functionalities 
          * once the page is loaded.
          * Such functionalities include: 
          * 1) Loading current user's settings.
          */
            function init() {
                usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));

                currentUserSettings = _.find(usersSettings, function (userSettings) {
                    return userSettings.username == $rootScope.activeUser.username;
                });

                $scope.data = {
                    isNightmode: JSON.parse($window.sessionStorage.getItem("isNightmode")),
                    cachenewsEnabled: currentUserSettings.settings.cachenewsEnabled,
                    fontsize: currentUserSettings.settings.fontsize,
                    fontsizeRange: currentUserSettings.settings.fontsizeRange,
                    markupEnabled: currentUserSettings.settings.markupEnabled,
                    hideEnabled: currentUserSettings.settings.hideEnabled,
                    tolerance: currentUserSettings.settings.tolerance,
                };

                usersArticleCache = JSON.parse($window.localStorage.getItem("usersArticleCache"));
            }
        }
    ])