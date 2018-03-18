angular
    .module("app.controllers")


    /**
     * @module welcomeCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the welcome template.
     */
    .controller("welcomeCtrl", ["$scope", "$stateParams", "sharedProps", "$state", "Application",
        function ($scope, $stateParams, sharedProps, $state, Application) {
            
            $scope.goToLogin = function(){
                Application.setInitialRun(false);
                $state.go("login");
            }

        }
    ]);