angular
    .module("app.controllers", ["ngCordova", "ngStorage", "chart.js"])

.controller("newsFeedCtrl", ["$scope","$rootScope","$http","$stateParams","sharedProps","$ionicPopup",
    "$ionicActionSheet","$timeout","$localStorage","$sessionStorage",
    function($scope,$rootScope,$http,$stateParams,sharedProps,$ionicPopup,$ionicActionSheet,
    $timeout,$localStorage,$sessionStorage) {
        $scope.sources = {
            total: 2
        };

        $http.get("./test_data/articles/templateArticle.js").then(function(res) {
            $scope.articles = res.data;
        });

        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) 
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
                if (sharedProps.getData("savedArticlesIds") != undefined)
                    $scope.savedArticlesIds = sharedProps.getData("savedArticlesIds").value;
                else 
                    $scope.savedArticlesIds = [];
            getFontSize();
        });

        $scope.$on("$ionicView.beforeLeave",function(){
            sharedProps.addData("savedArticlesIds", $scope.savedArticlesIds);
        });

        function getFontSize(){
            var f = sharedProps.getData("fontsize");
            if (f != undefined) 
                $scope.selectedFontsizeVal = f.value;
            else 
                $scope.selectedFontsizeVal = 100;

            $scope.fontsize = { 'font-size': $scope.selectedFontsizeVal + '%' }
            $scope.fontsizeSmaller = {'font-size': ($scope.selectedFontsizeVal - 20) + '%'}
        }

        $scope.showReportOptions = function() {
            var promptAlert = $ionicPopup.show({
                title: "Report",
                templateUrl: "templates/reportTemplate.html",
                buttons: [{
                        text: "Cancel",
                        type: "button-stable button-outline",
                        onTap: function(e) {
                            //e.preventDefault();
                        }
                    },
                    {
                        text: "Confirm",
                        type: "button-positive",
                        onTap: function(e) {}
                    }
                ]
            });
        };

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ? "nightmodeBackground" : "lightmodeBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.getNightmodeHeaderClass = function() {
            return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
        };

        $scope.saveArticle = function(id) {
            if (_.contains($scope.savedArticlesIds, id)) {
                $scope.savedArticlesIds = unsaveArticle(id);
                showRemovedToast();
                return;
            }
            $scope.savedArticlesIds.push(id);
            showSavedToast();
        };

        $scope.isArticleSaved = function(id) {
            if (_.contains($scope.savedArticlesIds, id))
                return true;
            else
                false
        };

        function deleteArticle(id){
            var article = _.find($scope.articles, function(a){
                return a.Id == id;
            })
            article.Deleted = true;
            $scope.articles.splice(_.indexOf($scope.articles, article),1);
        }

        $scope.showDeleteConfirm = function(id) {
            var promptAlert = $ionicPopup.show({
                title: "Warning",
                template: "<span>Are you sure you want to delete this article?</span>",
                buttons: [{
                        text: "Cancel",
                        type: "button-stable button-outline",
                        onTap: function(e) {
                            //e.preventDefault();
                        }
                    },
                    {
                        text: "Confirm",
                        type: "button-positive",
                        onTap: function(e) {
                            deleteArticle(id);
                            showDeletedToast();
                        }
                    }
                ]
            });
        };

        function showDeletedToast() {
            var hideSheet = $ionicActionSheet.show({
                titleText: "Article deleted"
            });
            $timeout(function() {
                hideSheet();
            }, 500);
        }

        function unsaveArticle(id) {
            return $scope.savedArticlesIds.filter(e => e !== id);
        }

        function showSavedToast() {
            var hideSheet = $ionicActionSheet.show({
                titleText: "Article saved"
            });
            $timeout(function() {
                hideSheet();
            }, 500);
        }

        function showRemovedToast() {
            var hideSheet = $ionicActionSheet.show({
                titleText: "Article unsaved"
            });
            $timeout(function() {
                hideSheet();
            }, 500);
        }
    }
])

.controller("settingsCtrl", ["$scope","$stateParams","$ionicPopup","$rootScope","sharedProps",
    "$interval","$timeout", 
    function($scope,$stateParams,$ionicPopup,$rootScope,sharedProps,$interval,$timeout) {
        $scope.data = {
            cachenewsEnabled: sharedProps.getData("cachenewsEnabled") == undefined ?
                false : sharedProps.getData("cachenewsEnabled").value,
            fontsize: sharedProps.getData("fontsize") == undefined ?
                100 : sharedProps.getData("fontsize").value,
            fontsizeRange : getFontsizeRangeVal(),
            markupEnabled: sharedProps.getData("markupEnabled") == undefined ?
                false : sharedProps.getData("markupEnabled").value,
            hideEnabled: sharedProps.getData("hideEnabled") == undefined ?
                false : sharedProps.getData("hideEnabled").value,
            tolerance: sharedProps.getData("tolerance") == undefined ?
                50 : sharedProps.getData("tolerance").value
        };

        function getFontsizeRangeVal(){
            var f = sharedProps.getData("fontsize");
            if (f == undefined)
                    return 16;
                else{
                    if (f.value == 87.5)
                        return 14;
                    else if (f.value == 100)
                        return 16;
                    else if (f.value == 112.5)
                        return 18;
                    else 
                        return 20;
                }      
        }

        $scope.$on("$ionicView.beforeLeave", function() {
            sharedProps.addData("cachenewsEnabled", $scope.data.cachenewsEnabled);
            sharedProps.addData("markupEnabled", $scope.data.markupEnabled);
            sharedProps.addData("hideEnabled", $scope.data.hideEnabled);
            sharedProps.addData("tolerance", $scope.data.tolerance);
        });

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
            return $scope.data.isNightmode ?
                "nightmodeFontColor" :
                "normalBlackLetters";
        };

        $scope.$watch("data.fontsizeRange", function() {
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
            sharedProps.addData('fontsize', $scope.fontsize);
        });
    }
])

.controller("addSourcesCtrl", ["$scope","$http","$stateParams","sharedProps","$ionicActionSheet",
    "$timeout", 
    function($scope,$http,$stateParams,sharedProps,$ionicActionSheet,$timeout) {
        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) 
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
            getFontSize();
        });

        function getFontSize(){
            var f = sharedProps.getData("fontsize");
            if (f != undefined) 
                $scope.selectedFontsizeVal = f.value;
            else 
                $scope.selectedFontsizeVal = 100;
            $scope.fontsize = { 'font-size': $scope.selectedFontsizeVal + '%' }
        }

        $scope.sources = {
            total: 0,
            sites: []
        };

        $http.get("./test_data/sources.js").then(function(res) {
            $scope.sources.sites = res.data;
            $scope.sources.total = $scope.sources.sites.length;
        });

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ? "nightmodeBackground" : "lightmodeBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.selectSource = function(sourceTitle) {
            showSuccessToast(sourceTitle);
        };

        $scope.deselectSource = function(sourceTitle) {};

        function showSuccessToast(sourceTitle) {
            var hideSheet = $ionicActionSheet.show({
                titleText: sourceTitle + " selected"
            });
            $timeout(function() {
                hideSheet();
            }, 500);
        }

        function showFailureToast(sourceTitle) {
            var hideSheet = $ionicActionSheet.show({
                titleText: "Failed to select " + sourceTitle
            });
            $timeout(function() {
                hideSheet();
            }, 500);
        }
    }
])

.controller("eyeReaderCtrl", ["$scope","$stateParams","$rootScope","sharedProps", "$ionicPopup",
"$state","AuthenticationService",
    function($scope, $stateParams, $rootScope, sharedProps, $ionicPopup, $state,AuthenticationService) {
        $scope.currUser = $rootScope.globals.currentUser.username;

        $rootScope.$on("usernameChange", function(event,args){
            $scope.currUser = $rootScope.globals.currentUser.username;
        });

        $rootScope.$on("nightmodeChange", function(event, args) {
            $scope.isNightmode = args;
        });

        $rootScope.$on("fontsizeChange", function(event, args) {
            $scope.selectedFontsize = { 'font-size': args + '%' };
        });

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ? "nightmodeBackground" : "normalBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.getSidemenuIconClass = function() {
            return $scope.isNightmode ? "nightmodeSidemenuIcon" : "normalSidemenuIcon";
        };

        $scope.getNightmodeHeaderClass = function() {
            return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
        };

        $scope.logout = function(){
            var promptAlert = $ionicPopup.show({
                title: "Warning",
                template: '<span>Are you sure you want to <strong>logout</strong>?</span>',
                buttons: [{
                    text: "Cancel",
                    type: "button-stable button-outline",
                    onTap: function(e) {}
                },{
                    text: "Confirm",
                    type: "button-positive",
                    onTap: function(e) {
                        AuthenticationService.ClearCredentials();
                        $state.go("login");
                    }
                }]
            });
        };
    }
])

.controller("profileCtrl", ["$scope","$rootScope","$stateParams","sharedProps",
    function($scope, $rootScope, $stateParams, sharedProps) {
        $scope.user = $rootScope.activeUser;
        if ($scope.user.sex == 0)
            $scope.displaySex = "Female";
        else if ($scope.user.sex == 1) 
            $scope.displaySex = "Male";
        else 
            $scope.displaySex = "Other";
        

        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) {
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
            }
            getFontSize();
        });

        function getFontSize(){
            var f = sharedProps.getData("fontsize");
            if (f != undefined)
                $scope.selectedFontsizeVal = f.value;
            else 
                $scope.selectedFontsizeVal = 100;

            $scope.fontsize = { 'font-size': $scope.selectedFontsizeVal + '%' }
        }

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ? "nightmodeBackground" : "normalBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };
    }
])

.controller("editProfileCtrl", ["$scope","$rootScope","$stateParams","sharedProps","$timeout",
    "$state", "UserService",
    function($scope, $rootScope, $stateParams, sharedProps, $timeout, $state, UserService) {
        $scope.sexOptions = [
            { name: "Female", id: 0 },
            { name: "Male", id: 1 },
            { name: "Other", id: 2 }
        ];
        $scope.user = $rootScope.activeUser;
        $scope.editedUser = $scope.user;
        $scope.selectedSex = $scope.editedUser.sex;
        $scope.editedUser.birthday = new Date($scope.editedUser.birthday);

        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined)
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
            getFontSize();
        });

        function getFontSize(){
            var f = sharedProps.getData("fontsize");
            if (f != undefined) 
                $scope.selectedFontsizeVal = f.value;
            else 
                $scope.selectedFontsizeVal = 100;
            $scope.fontsize = { 'font-size': $scope.selectedFontsizeVal + '%' }
        }

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ? "nightmodeBackground" : "lightmodeBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.editProfile = function(){
            UserService.Update($scope.editedUser).then(function(response) {
                if (response.success) {
                    $rootScope.$broadcast("usernameChange", $scope.editedUser.username);
                    $state.go("eyeReader.profile");
                } else {
                    //TODO: Display error toast for failed to update profile.
                }
            });
        }
    }
])

.controller("signupCtrl", ["$scope","$stateParams","sharedProps","UserService","$window",
            "$state","$ionicPopup",
    function($scope, $stateParams, sharedProps, UserService, $window, $state, $ionicPopup) {
        //$window.localStorage.clear();
        $scope.user = {};
        $scope.sexOptions = [{ name: "Female", id: 0 }, { name: "Male", id: 1 }, { name: "Other", id: 2 }];
        $scope.user.sex = 0;
        $scope.user.birthday = new Date();
        $scope.user.firstTime = true;

        $scope.register = function() {
            UserService.Create($scope.user).then(function(response) {
                if (response.success) 
                    $state.go("login");
                else
                    showFailedToRegisterPopup(response);
            });
        };

        function showFailedToRegisterPopup(resp) {
            var promptAlert = $ionicPopup.show({
                title: "Error",
                template: '<span>Failed to register! '+resp.message+'.</span>',
                buttons: [{
                    text: "OK",
                    type: "button-positive",
                    onTap: function(e) {}
                }]
            });
        };
    }
])

.controller("loginCtrl", ["$scope","$stateParams","sharedProps","$location","AuthenticationService",
    "$state","$window","$ionicPopup", "$ionicActionSheet", "$timeout", 
    function($scope,$stateParams,sharedProps,$location,AuthenticationService,$state,$window,
        $ionicPopup, $ionicActionSheet, $timeout) {
        function createUserSettings() {
            sharedProps.addData("isNightmode", false);
            sharedProps.addData("cachenewsEnabled", false);
            sharedProps.addData("fontsize", 100);
            sharedProps.addData("markupEnabled", false);
            sharedProps.addData("hideEnabled", false);
            sharedProps.addData("tolerance", 50);
        }

        function loadUserSettings() {
            var usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));

            var currentUserSettings = _.find(usersSettings, function(userSettings){
                userSettings.username == $scope.login.username;
            });
            sharedProps.addData("isNightmode", currentUserSettings.isNightmode);
            sharedProps.addData("cachenewsEnabled",  currentUserSettings.cachenewsEnabled);
            sharedProps.addData("fontsize",  currentUserSettings.fontsize);
            sharedProps.addData("markupEnabled",  currentUserSettings.markupEnabled);
            sharedProps.addData("hideEnabled",  currentUserSettings.hideEnabled);
            sharedProps.addData("tolerance",  currentUserSettings.tolerance);
        }

        function showFailedToLoginPopup(resp) {
            var promptAlert = $ionicPopup.show({
                title: "Error",
                template: '<span>Failed to login! '+resp.message+'.</span>',
                buttons: [{
                    text: "OK",
                    type: "button-positive",
                    onTap: function(e) {}
                }]
            });
        };

        $scope.login = function() {
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
                        //TODO: REMOVE COMMENT FROM CODE TO CHECK IN APP IF SETTINGS ARE PRESERVED
                        // if (response.firstTime)
                        //     createUserSettings();
                        // else
                        //     loadUserSettings();
                        $state.go("eyeReader.newsFeed");
                    } else {
                        showFailedToLoginPopup(response);
                    }
                }
            );
        };
    }
])

.controller("articleCtrl", ["$scope","$stateParams","sharedProps", 
    function($scope, $stateParams, sharedProps) {
        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) 
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
            getFontSize();
        });

        function getFontSize(){
            var f = sharedProps.getData("fontsize");
            if (f != undefined) 
                $scope.selectedFontsizeVal = f.value;
            else 
                $scope.selectedFontsizeVal = 100;

            $scope.fontsize = { 'font-size': ($scope.selectedFontsizeVal) + '%' }
        }

        $scope.article = $stateParams.article;

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ? "nightmodeBackground" : "lightmodeBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.getNightmodeHeaderClass = function() {
            return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
        };
    }
])

.controller("savedArticlesCtrl", ["$scope","$stateParams","sharedProps","$http",
    function($scope, $stateParams, sharedProps,$http) {
        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) 
                $scope.isNightmode = sharedProps.getData("isNightmode").value;

                console.log($scope.savedArticlesIds);
                $http.get("./test_data/articles/templateArticle.js").then(function(res) {
                    $scope.articles = res.data;
                    $scope.savedArticles = [];

                    if (sharedProps.getData("savedArticlesIds") != undefined)
                        $scope.savedArticlesIds = sharedProps.getData("savedArticlesIds").value;
                    else 
                        $scope.savedArticlesIds = [];
        
                        
                        console.log($scope.savedArticlesIds);
                        if ($scope.savedArticlesIds.length > 0){
                            for (var i=0; i<$scope.savedArticlesIds.length; i++){
                                $scope.savedArticles.push(_.find($scope.articles, function(el){
                                    return el.Id == $scope.savedArticlesIds[i];
                                }));
                            }
                        }
                        
                        
                });    
            getFontSize();
        });

        

        function getFontSize(){
            var f = sharedProps.getData("fontsize");
            if (f != undefined) 
                $scope.selectedFontsizeVal = f.value;
            else 
                $scope.selectedFontsizeVal = 100;

            $scope.fontsize = { 'font-size': $scope.selectedFontsizeVal + '%' }
            $scope.fontsizeSmaller = { 'font-size': ($scope.selectedFontsizeVal - 20) + '%' }
        }

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ? "nightmodeBackground" : "lightmodeBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.getNightmodeHeaderClass = function() {
            return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
        };
    }
])

.controller("statisticsCtrl", ["$scope","$stateParams","sharedProps","$timeout",
    function($scope, $stateParams, sharedProps, $timeout) {
        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined) {
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
            }
            getFontSize();
        });

        function getFontSize(){
            var f = sharedProps.getData("fontsize");
            if (f != undefined) 
                $scope.selectedFontsizeVal = f.value;
            else 
                $scope.selectedFontsizeVal = 100;
            $scope.fontsize = { 'font-size': $scope.selectedFontsizeVal + '%' }
            $scope.fontsizeSmaller = { 'font-size': ($scope.selectedFontsizeVal - 20) + '%' }
        }

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ? "nightmodeBackground" : "lightmodeBackground";
        };

        $scope.getFontClass = function() {
            return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
        };

        $scope.getNightmodeHeaderClass = function() {
            return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
        };

        $scope.selectSource = [{ name: "All Sources", id: 0 }, { name: "Source x", id: 1 }, { name: "Source y", id: 2 }];
        $scope.viewStatistics = [{ name: "Report", id: 0 }, { name: "Hate Speech", id: 1 }, { name: "Sentiment Analysis", id: 2 }];
        $scope.selectedStatistic = 0;
        $scope.selectedSource = 0;  

        $scope.labels = ["January", "February", "March", "April", "May"];
        $scope.series = ['Series A'];
        $scope.data = [
          [65, 59, 80, 81, 56]
        ];

        // Simulate async data update
        $timeout(function () {
          $scope.data = [
            [28, 48, 40, 19, 86]
          ];
        }, 3000);
    }
])

.controller("reportArticleCtrl", ["$scope","$stateParams","sharedProps",
    function($scope, $stateParams, sharedProps) {
        $scope.$on("$ionicView.beforeEnter", function() {
            if (sharedProps.getData("isNightmode") != undefined)
                $scope.isNightmode = sharedProps.getData("isNightmode").value;
        });

        $scope.getBackgroundClass = function() {
            return $scope.isNightmode ? "nightmodeBackground" : "lightmodeBackground";
        };
    }
]);