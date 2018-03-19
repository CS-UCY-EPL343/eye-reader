angular
    .module("app.controllers")

    /**
     * @module statisticsCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the statistics view.
     */
    .controller("statisticsCtrl", ["$scope", "sharedProps", "$timeout", "$ionicLoading", "$window", "$rootScope",
        function ($scope, sharedProps, $timeout, $ionicLoading, $window, $rootScope) {

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
                //font size for normal letters
                $scope.fontsize = { 'font-size': data.fontsize + '%' }
                //font size for smaller letters than the normal ones
                $scope.fontsizeSmaller = { 'font-size': (data.fontsize - 20) + '%' }
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
                var usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));

                var currentUserSettings = _.find(usersSettings, function (userSettings) {
                    return userSettings.username == $rootScope.activeUser.username;
                });

                data = {
                    // cachenewsEnabled: currentUserSettings.settings.cachenewsEnabled,
                    fontsize: currentUserSettings.settings.fontsize,
                    // markupEnabled: currentUserSettings.settings.markupEnabled,
                    // hideEnabled: currentUserSettings.settings.hideEnabled,
                    // tolerance: currentUserSettings.settings.tolerance,
                };

                $ionicLoading.hide();
            }
        }
    ])
