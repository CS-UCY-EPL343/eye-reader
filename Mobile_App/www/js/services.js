angular
    .module("app.services", [])
    /**
     * @module servicesjs
     * @description Default module create by Ionic v1 and AngularJS for app services.
     */

    /**
     * @module Application
     * @memberof servicesjs
     * @description Stores in the local storage if this is or not the application's first run
     * on this device.
     */
    .factory('Application', ["$window", function ($window) {
        return {
            setInitialRun: function (initial) {
                $window.localStorage.setItem("usersInitialRun", initial ? "true" : "false");
            },
            isInitialRun: function () {
                var value = $window.localStorage.getItem("usersInitialRun") || "true";
                return value == "true";
            }
        }
    }])

    /**
     * @module UserService
     * @memberof servicesjs
     * @description Factory that works like an offline user service.
     */
    .factory("UserService", ["$timeout", "$q", "$rootScope", "$window", function ($timeout, $q, $rootScope, $window) {
        var service = {};

        service.GetAll = GetAll;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;

        return service;

        /**
         * @function
         * @memberof servicesjs.UserService
         * @returns {object} All the users' info.
         * @description Responsible for returning all the registered users' info from the devices local storage.
         */
        function GetAll() {
            var deferred = $q.defer();
            deferred.resolve(getUsers());
            return deferred.promise;
        }


        /**
         * @function
         * @memberof servicesjs.UserService
         * @returns {string} The currently logged in user's username
         * @description Responsible for returning the username of the currently logged in user.
         */
        function GetByUsername(username) {
            var deferred = $q.defer();
            var filtered = _.filter(getUsers(), function (user) { return user.username == username; });
            var user = filtered.length ? filtered[0] : null;
            deferred.resolve(user);
            return deferred.promise;
        }

        /**
         * @function
         * @memberof servicesjs.UserService
         * @param {object} user The new user's profile details
         * @return {promise} Success if the profile was created / Failure if not
         * @description Responsible for searching the usernames registered in the app to check if the
         * new profile's username is not already registered. If not then a new profile is created 
         * with the input details and a success promise is returned. If it is, then a failed promise is returned.
         */
        function Create(user) {
            var deferred = $q.defer();

            // simulate api call with $timeout
            $timeout(function () {
                GetByUsername(user.username)
                    .then(function (duplicateUser) {
                        if (duplicateUser !== null) {
                            deferred.resolve({ success: false, message: 'Username "' + user.username + '" is already taken' });
                        } else {
                            var users = getUsers();

                            // assign id
                            var lastUser = users[users.length - 1] || { id: 0 };
                            user.id = lastUser.id + 1;

                            // save to local storage
                            users.push(user);
                            setUsers(users);

                            deferred.resolve({ success: true });
                        }
                    });
            }, 0);

            return deferred.promise;
        }

        /**
         * @function
         * @memberof servicesjs.UserService
         * @param {object} user The user's updated profile details
         * @return {promise} Success if the profile was updated / Failure if not
         * @description Responsible for searching to find the given user's profile details and update them with 
         * the new given details. If the process is successful then a success promise is returned,
         * else a failed promise is returned.
         */
        function Update(user) {
            var deferred = $q.defer();
            user.firstTime = false;
            var users = getUsers();
            for (var i = 0; i < users.length; i++) {
                if (users[i].id === user.id) {
                    users[i] = user;
                    break;
                }
            }
            setUsers(users);

            $rootScope.activeUser.username = user.username;
            $rootScope.globals.currentUser.username = user.username;
            deferred.resolve({ success: true });

            return deferred.promise;
        }

        /**
         * @function
         * @memberof servicesjs.UserService
         * @return {object} A json object with all the users' profile details
         * @description Responsible for retrieving and returning all the users' profile details.
         */
        function getUsers() {
            if (!localStorage.users) {
                localStorage.users = JSON.stringify([]);
            }

            return JSON.parse(localStorage.users);
        }

        /**
         * @function
         * @memberof servicesjs.UserService
         * @param {object} users All the users' profile details
         * @description Responsible for storing the users' profile details in the local storage.  
         */
        function setUsers(users) {
            localStorage.users = JSON.stringify(users);
        }

    }])

    /**
     * @module AuthenticationService
     * @memberof servicesjs
     * @description Factory that works like an offline user authentication service.
     */
    .factory('AuthenticationService', ['$http', '$rootScope', '$timeout', 'UserService',
        function ($http, $rootScope, $timeout, UserService) {

            var service = {};

            service.Login = Login;
            service.SetCredentials = SetCredentials;
            service.ClearCredentials = ClearCredentials;

            return service;

            /**
             * @function
             * @memberof servicesjs.AuthenticationService
             * @param {string} username The user's username
             * @param {string} password The user's password
             * @param {string} callback The response message back to the caller function
             * @description Responsible for searching all the users' profiles to find the matching username in the 
             * users' list. If the username is not found then a failure callback is returned. Else if the username is 
             * found, then it checks if the password matches. If it does, it returns a success callback. If not, 
             * then it returns a failure callback.
             */
            function Login(username, password, callback) {
                $timeout(function () {
                    var response;
                    UserService.GetByUsername(username)
                        .then(function (user) {
                            if (user !== null && user.password === password) {
                                response = { success: true };
                            } else {
                                response = { success: false, message: 'Username or password is incorrect' };
                            }
                            $rootScope.activeUser = user;
                            callback(response);
                        });
                }, 0);
            }

            /**
             * @function
             * @memberof servicesjs.AuthenticationService
             * @param {string} username The user's username
             * @param {string} password The user's password
             * @description Responsible for setting the logged in user's username and password in global view.
             */
            function SetCredentials(username, password) {
                var authdata = username + ':' + password;

                $rootScope.globals = {
                    currentUser: {
                        username: username,
                        authdata: authdata
                    }
                };

            }

            /**
             * @function
             * @memberof servicesjs.AuthenticationService
             * @description Responsible for clearing the global username and password values.
             */
            function ClearCredentials() {
                $rootScope.globals = {
                    currentUser: {}
                };
                $rootScope.activeUser = [];
            }
        }

    ])


    /**
     * @module ConnectionMonitor
     * @memberof servicesjs
     * @description Factory that checks if the device is connected to the internet
     */
    .factory('ConnectionMonitor', function ($rootScope, $cordovaNetwork) {

        return {
            isOnline: function () {
                if (ionic.Platform.isWebView()) {
                    return $cordovaNetwork.isOnline();
                    // return false;
                } else {
                    return navigator.onLine;
                    // return false;
                }
            },
            isOffline: function () {
                if (ionic.Platform.isWebView()) {
                    return !$cordovaNetwork.isOnline();
                } else {
                    return !navigator.onLine;
                }
            },
            startWatching: function () {
                if (ionic.Platform.isWebView()) {

                    $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                        $rootScope.$broadcast("networkChange", true);
                    });

                    $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                        $rootScope.$broadcast("networkChange", false);
                    });

                } else {

                    window.addEventListener("online", function (e) {
                        $rootScope.$broadcast("networkChange", true);
                    });

                    window.addEventListener("offline", function (e) {
                        $rootScope.$broadcast("networkChange", false);
                    });
                }
            }
        }
    })