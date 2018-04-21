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
        cache: "false",
        views: {
            "side-menu21": {
                templateUrl: "templates/newsFeed.html",
                controller: "newsFeedCtrl"
            }
        }
    })

    .state("eyeReader.settings", {

        url: "/settings",
        cache: "false",
        views: {
            "side-menu21": {
                templateUrl: "templates/settings.html",
                controller: "settingsCtrl"
            }
        }
    })

    .state("eyeReader.addSources", {

        url: "/addsources",
        cache: "false",
        views: {
            "side-menu21": {
                templateUrl: "templates/addSources.html",
                controller: "addSourcesCtrl"
            }
        }
    })

    .state("eyeReader", {

        url: "/side-menu",
        cache: "false",
        templateUrl: "templates/eyeReader.html",
        controller: "eyeReaderCtrl"
    })

    .state("eyeReader.profile", {

        url: "/Profile",
        cache: "false",
        views: {
            "side-menu21": {
                templateUrl: "templates/profile.html",
                controller: "profileCtrl"
            }
        }
    })

    .state("eyeReader.editProfile", {

        url: "/EditProfile",
        cache: "false",
        views: {
            "side-menu21": {
                templateUrl: "templates/editProfile.html",
                controller: "editProfileCtrl"
            }
        }
    })

    .state("signup", {

        url: "/signup",
        cache: "false",
        templateUrl: "templates/signup.html",
        controller: "signupCtrl"
    })

    .state("login", {

        url: "/login",
        cache: "false",
        templateUrl: "templates/login.html",
        controller: "loginCtrl",
        cache: false
    })

    .state("eyeReader.article", {

        url: "/article/:id",
        cache: "false",
        views: {
            "side-menu21": {
                templateUrl: "templates/article.html",
                controller: "articleCtrl"
            }
        }
    })

    .state("eyeReader.savedArticles", {

        url: "/savedArticles",
        cache: "false",
        views: {
            "side-menu21": {
                templateUrl: "templates/savedArticles.html",
                controller: "savedArticlesCtrl"
            }
        }
    })

    .state("eyeReader.statistics", {

        url: "/Statistics",
        cache: "false",
        views: {
            "side-menu21": {
                templateUrl: "templates/statistics.html",
                controller: "statisticsCtrl"
            }
        }
    })

    .state("reportArticle", {

        url: "/reportArticle",
        cache: "false",
        templateUrl: "templates/reportArticle.html",
        controller: "reportArticleCtrl"
    });
});