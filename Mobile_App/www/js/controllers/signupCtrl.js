angular
    .module("app.controllers")
   

    /**
     * @module signupCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the edit sign up view.
     */
    .controller("signupCtrl", ["$scope", "$stateParams", "sharedProps", "UserService", "$window",
        "$state", "$ionicPopup", "$ionicLoading",
        function ($scope, $stateParams, sharedProps, UserService, $window, $state, $ionicPopup, $ionicLoading) {
            init();

            /**
              * @function
              * @memberof controllerjs.signupCtrl
              * @description This function is responsible for sending the values of the new user's profile 
              * to be saved in the device's local storage and changes from the current page to the login page. 
              * If the profile saving fails, then an informative message is displayed.
              */
            $scope.register = function () {
                UserService.Create($scope.user).then(function (response) {
                    if (response.success)
                        $state.go("login");
                    else
                        showFailedToRegisterPopup(response);
                });
            };

            /**
              * @function
              * @memberof controllerjs.signupCtrl
              * @param {object} resp - The response message from when trying to save the profile details in the local storage.
              * @description This function is responsible for displaying an informative message that the new profile could not 
              * be created.
              */
            function showFailedToRegisterPopup(resp) {
                var promptAlert = $ionicPopup.show({
                    title: "Error",
                    template: '<span>Failed to register! ' + resp.message + '.</span>',
                    buttons: [{
                        text: "OK",
                        type: "button-positive",
                        onTap: function (e) { }
                    }]
                });
            };

            /**
            * @function
            * @memberof controllerjs.signupCtrl
            * @description This function is responsible for calling all the functions that need to 
            * be executed when the page is initialized.
            */
            function init() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles" class="spinner-light"></ion-spinner>',
                });
                //$window.localStorage.clear();
                //creates ojects for the new user's profile
                $scope.user = {};
                $scope.sexOptions = [{ name: "Female", id: 0 }, { name: "Male", id: 1 }, { name: "Other", id: 2 }];
                $scope.user.sex = 0;
                $scope.user.birthday = new Date();
                $scope.user.firstTime = true;
                $ionicLoading.hide();
            }
        }
    ])