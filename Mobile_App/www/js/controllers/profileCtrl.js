angular
    .module("app.controllers")

    /**
     * @module profileCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the profile view.
     */
    .controller("profileCtrl", ["$scope", "$rootScope", "$window",
        function ($scope, $rootScope, $window) {
            var data = {};
            init();
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
                var n = JSON.parse($window.sessionStorage.getItem("isNightmode"));
                if (n != undefined)
                    $scope.isNightmode = n;
                data.fontsize = JSON.parse($window.sessionStorage.getItem("fontsize"));
                getFontSize();
            });

            /**
             * @function
             * @memberof controllerjs.profileCtrl
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
              * @memberof controllerjs.profileCtrl
              * @description Sets the appropriate background class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode 
              * background.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalBackground";
            };

            /**
              * @function
              * @memberof controllerjs.profileCtrl
              * @description Sets the appropriate font color class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.profileCtrl
              * @description Responsible for calling all the functions and executing necessary functionalities 
              * once the page is loaded.
              * Such functionalities include: 
              * 1) Loading current user.
              */
            function init() {
                //gets the currently active user
                $scope.user = $rootScope.activeUser;
            }
        }
    ])