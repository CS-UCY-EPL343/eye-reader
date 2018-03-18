angular
    .module("app.controllers")

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
    ])