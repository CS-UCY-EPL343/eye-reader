angular
    .module("app.controllers")


    /**
     * @module welcomeCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the welcome view.
     */
    .controller("welcomeCtrl", ["$scope", "$state", "Application",
        function ($scope, $state, Application) {

            /**
             * @function
             * @memberof controllerjs.welcomeCtrl
             * @description Responsible for setting the application's initial run value to false so that
             * the welcome page will not be displayed again if the application will be run again on the
             * current device. Then it redirects the application to the login view.
             */
            $scope.goToLogin = function () {
                Application.setInitialRun(false);
                $state.go("login");
            }

        }
    ]);