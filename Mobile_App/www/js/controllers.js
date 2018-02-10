angular
    .module("app.controllers", ["ngCordova"])

.controller("newsFeedCtrl", [
    "$scope",
    "$stateParams",
    "sharedProps", "$ionicPopup", // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, sharedProps, $ionicPopup) {
        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) {
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
            }
        });

        $scope.showReportOptions = function() {
            var promptAlert = $ionicPopup.alert({
                title: "Report",
                template: ""
            });
        };

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ?
                "nightmodeBackground" :
                "lightmodeBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.getNightmodeHeaderClass = function() {
            return $scope.isNightmode ?
                "nightmodeHeaderClass" :
                "normalHeaderClass";
        };
    }
])

.controller("settingsCtrl", [
    "$scope",
    "$stateParams",
    "$ionicPopup",
    "$rootScope",
    "sharedProps", // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, $ionicPopup, $rootScope, sharedProps) {

        $scope.data = {};

        $scope.$on("$ionicView.beforeEnter", function() {
            console.log("entering...");
            $scope.data.cachenewsEnabled = sharedProps.getData("cachenewsEnabled").value;
            $scope.data.fontsize = sharedProps.getData("fontsize").value;
            $scope.data.markupEnabled = sharedProps.getData("markupEnabled").value;
            $scope.data.hideEnabled = sharedProps.getData("hideEnabled").value;
            $scope.data.tolerance = sharedProps.getData("tolerance").value;

            console.log($scope.data.tolerance + " " + $scope.data.fontsize);

        });

        $scope.$on("$ionicView.beforeLeave", function() {
            console.log("trying to leave....");
            sharedProps.addData("cachenewsEnabled", $scope.data.cachenewsEnabled);
            sharedProps.addData("fontsize", $scope.data.fontsize);
            sharedProps.addData("markupEnabled", $scope.data.markupEnabled);
            sharedProps.addData("hideEnabled", $scope.data.hideEnabled);
            sharedProps.addData("tolerance", $scope.data.tolerance);

        })

        $scope.setFontsize = function() {
            //$rootScope.$broadcast("fontsizeChange", $scope.data.fontsize);

        }

        $scope.setNightmode = function() {
            $rootScope.$broadcast("nightmodeChange", $scope.data.isNightmode);
            sharedProps.addData("isNightmode", $scope.data.isNightmode);
        };

        $scope.getBackgroundClass = function() {
            return $scope.data.isNightmode ?
                "nightmodeBackgroundMain" :
                "normalBackgroundMain";
        };

        $scope.getFontClass = function() {
            return $scope.data.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.showDisplayInformation = function() {
            var promptAlert = $ionicPopup.alert({
                title: "Display Information",
                template: "<b>Night Mode:</b> Enables night mode for easier reading in low lighting environment.</br>" +
                    "<b>Cache News:</b> Enables caching of 10 latest retrieved articles for offline reading.</br>" +
                    "<b>Font Size:</b> Sets the font size [Range available 14px-24px]."
            });
        };

        $scope.showFilteringInformation = function() {
            var promptAlert = $ionicPopup.alert({
                title: "Filtering Information",
                template: "<b>Markup Toxic:</b> Highlights toxic language.</br>" +
                    "<b>Hide Toxic:</b> Removes toxic language from view.</br>" +
                    "<b>Tolerance:</b> Sets your prefered tolerance level against toxic language. The higher the bar the less tolerant you are."
            });
        };
    }
])

.controller("addSourcesCtrl", [
    "$scope",
    "$stateParams",
    "sharedProps", // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, sharedProps) {
        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) {
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
            }
        });

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ?
                "nightmodeBackground" :
                "lightmodeBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };
    }
])

.controller("eyeReaderCtrl", [
    "$scope",
    "$stateParams",
    "$rootScope",
    "sharedProps", // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, $rootScope, sharedProps) {
        $rootScope.$on("nightmodeChange", function(event, args) {
            $scope.isNightmode = args;
        });

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ? "nightmodeBackground" : "normalBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.getSidemenuIconClass = function() {
            return $scope.isNightmode ?
                "nightmodeSidemenuIcon" :
                "normalSidemenuIcon";
        };

        $scope.getNightmodeHeaderClass = function() {
            return $scope.isNightmode ?
                "nightmodeHeaderClass" :
                "normalHeaderClass";
        };
    }
])

.controller("profileCtrl", [
    "$scope",
    "$stateParams",
    "sharedProps", // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, sharedProps) {
        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) {
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
            }
        });

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ? "nightmodeBackground" : "normalBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };
    }
])

.controller("editProfileCtrl", [
    "$scope",
    "$stateParams",
    "sharedProps", // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, sharedProps) {
        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) {
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
            }
        });

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ?
                "nightmodeBackground" :
                "lightmodeBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };
    }
])

.controller("signupCtrl", [
    "$scope",
    "$stateParams",
    "sharedProps",
    "UserService",
    "$window",
    "$state", // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, sharedProps, UserService, $window, $state) {
        $window.localStorage.clear();
        $scope.register = function() {
            $scope.info.dataLoading = true;
            UserService.Create($scope.info.user).then(function(response) {
                if (response.success) {
                    console.log("signup successfull");
                    $state.go("login");
                } else {
                    console.log("signup unsuccessfull");
                    $scope.info.dataLoading = false;
                }
                console.log($window.localStorage.users);
            });
        };
    }
])

.controller("loginCtrl", [
    "$scope",
    "$stateParams",
    "sharedProps",
    "$location",
    "AuthenticationService",
    "$state",
    "$window", // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function(
        $scope,
        $stateParams,
        sharedProps,
        $location,
        AuthenticationService,
        $state,
        $window
    ) {
        function createUserSettings() {
            sharedProps.addData("isNightmode", false);
            sharedProps.addData("cachenewsEnabled", false);
            sharedProps.addData("fontsize", 16);
            sharedProps.addData("markupEnabled", false);
            sharedProps.addData("hideEnabled", false);
            sharedProps.addData("tolerance", 50);
        }

        $scope.login = function() {
            $scope.dataLoading = true;
            AuthenticationService.Login(
                $scope.login.username,
                $scope.login.password,
                function(response) {
                    if (response.success) {
                        AuthenticationService.SetCredentials(
                            $scope.login.username,
                            $scope.login.password
                        );
                        createUserSettings();
                        $state.go("eyeReader.newsFeed");
                        console.log("login successfull");
                    } else {
                        $scope.dataLoading = false;
                        console.log("failed to login");
                    }
                }
            );
        };
    }
])

.controller("articleCtrl", [
    "$scope",
    "$stateParams",
    "sharedProps", // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, sharedProps) {
        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) {
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
            }
        });

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ?
                "nightmodeBackground" :
                "lightmodeBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.getNightmodeHeaderClass = function() {
            return $scope.isNightmode ?
                "nightmodeHeaderClass" :
                "normalHeaderClass";
        };
    }
])

.controller("savedArticlesCtrl", [
    "$scope",
    "$stateParams",
    "sharedProps", // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, sharedProps) {
        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) {
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
            }
        });

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ?
                "nightmodeBackground" :
                "lightmodeBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.getNightmodeHeaderClass = function() {
            return $scope.isNightmode ?
                "nightmodeHeaderClass" :
                "normalHeaderClass";
        };
    }
])

.controller("statisticsCtrl", [
    "$scope",
    "$stateParams",
    "sharedProps", // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, sharedProps) {
        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) {
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
            }
        });

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ?
                "nightmodeBackground" :
                "lightmodeBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.getNightmodeHeaderClass = function() {
            return $scope.isNightmode ?
                "nightmodeHeaderClass" :
                "normalHeaderClass";
        };
    }
]);