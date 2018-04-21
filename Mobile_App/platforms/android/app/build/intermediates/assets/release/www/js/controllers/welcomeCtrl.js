angular
    .module("app.controllers")


    /**
     * @module welcomeCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the welcome template.
     */
    .controller("welcomeCtrl", ["$scope", "$state", "Application",
        function ($scope, $state, Application) {
            
            /**
             * @function
             * @memberof controllerjs.welcomeCtrl
             * @description This function is responsible to set the initial run of the application to false
             * in order to disable the welcome screen from displaying when the app is relaunched and then
             * redirect the app to the login page.
             */
            $scope.goToLogin = function(){
                Application.setInitialRun(false);
                $state.go("login");
            }

        }
    ]);