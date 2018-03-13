angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider


    .state("welcome", {

        url: "/welcome",
        templateUrl: "templates/welcome.html",
        controller: "welcomeCtrl",
        cache: false
    })

    .state("eyeReader.newsFeed", {

        url: "/newsfeed",
        views: {
            "side-menu21": {
                templateUrl: "templates/newsFeed.html",
                controller: "newsFeedCtrl"
            }
        }
    })

    .state("eyeReader.settings", {

        url: "/settings",
        views: {
            "side-menu21": {
                templateUrl: "templates/settings.html",
                controller: "settingsCtrl"
            }
        }
    })

    .state("eyeReader.addSources", {

        url: "/addsources",
        views: {
            "side-menu21": {
                templateUrl: "templates/addSources.html",
                controller: "addSourcesCtrl"
            }
        }
    })

    .state("eyeReader", {

        url: "/side-menu",
        templateUrl: "templates/eyeReader.html",
        controller: "eyeReaderCtrl"
    })

    .state("eyeReader.profile", {

        url: "/Profile",
        views: {
            "side-menu21": {
                templateUrl: "templates/profile.html",
                controller: "profileCtrl"
            }
        }
    })

    .state("eyeReader.editProfile", {

        url: "/EditProfile",
        views: {
            "side-menu21": {
                templateUrl: "templates/editProfile.html",
                controller: "editProfileCtrl"
            }
        }
    })

    .state("signup", {

        url: "/signup",
        templateUrl: "templates/signup.html",
        controller: "signupCtrl"
    })

    .state("login", {

        url: "/login",
        templateUrl: "templates/login.html",
        controller: "loginCtrl",
        cache: false
    })

    .state("eyeReader.article", {

        url: "/article/{article:json}",
        views: {
            "side-menu21": {
                templateUrl: "templates/article.html",
                controller: "articleCtrl"
            }
        }
    })

    .state("eyeReader.savedArticles", {

        url: "/savedArticles",
        views: {
            "side-menu21": {
                templateUrl: "templates/savedArticles.html",
                controller: "savedArticlesCtrl"
            }
        }
    })

    .state("eyeReader.statistics", {

        url: "/Statistics",
        views: {
            "side-menu21": {
                templateUrl: "templates/statistics.html",
                controller: "statisticsCtrl"
            }
        }
    })

    .state("reportArticleTemplate", {

        url: "/reportTemplate",
        templateUrl: "templates/reportTemplate.html",
        controller: "reportArticleCtrl"
    });

    // $urlRouterProvider.otherwise('/login')
    $urlRouterProvider.otherwise('/welcome');

});