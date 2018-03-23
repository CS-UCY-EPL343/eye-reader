angular
    .module("app.services", [])
    /**
     * @module servicesjs
     * @description Default module create by Ionic v1 and AngularJS for app services.
     */


    /**
     * @module Application
     * @memberof servicesjs
     * @description Factory stores and checks a boolean in the local storage in order to know 
     * if this is the application's first run.
     */
    .factory('Application', ["$window", function ($window) {
        return {
            setInitialRun: function (initial) {
                $window.localStorage.setItem("initialRun", initial ? "true" : "false");
            },
            isInitialRun: function () {
                var value = $window.localStorage.getItem("initialRun") || "true";
                return value == "true";
            }
        }
    }])

    /**
     * @module sharedProps
     * @memberof servicesjs
     * @description Shared properties space that works like a local storage.
     */
    .factory("sharedProps", ["$rootScope", function () {
        var context = [];

        /**
         * @function
         * @memberof servicesjs.sharedProps
         * @param {string} key - The key under which the value will be saved
         * @param {object} value - The value that will be saved under the key
         * @description This function is responsible for searching context if a value
         * under the @param key is already stored. If true then it overwrites it, else it 
         * creates a new one.
         */
        var addData = function (key, value) {
            let obj = context.find(c => c.key == key);
            if (obj != undefined) {
                obj.value = value;
            } else {
                var data = {
                    key: key,
                    value: value
                };
                context.push(data);
            }
        };

        /**
         * @function
         * @memberof servicesjs.sharedProps
         * @param {string} key - The key under which a value is saved
         * @returns {object} - The object under the {@param key}
         * @description This function is responsible for searching the "obj" object if a value
         * under the @param key is already stored and return it.
         */
        var getData = function (key) {
            var data = _.find(context, function (t) {
                return t.key === key;
            });
            return data;
        };

        /**
         * @function
         * @memberof servicesjs.sharedProps
         * @returns {int} - The length of the context
         * @description This function is responsible for returning the length of the context.
         */
        var dataLength = function () {
            var length = context.length;
            return length;
        }

        return {
            addData: addData,
            getData: getData,
            dataLength: dataLength
        };
    }
    ])

    /**
     * @module UserService
     * @memberof servicesjs
     * @description Factory that works like an offline user service.
     */
    .factory("UserService", ["$timeout", "$q", "$rootScope", function ($timeout, $q, $rootScope) {
        var service = {};

        service.GetAll = GetAll;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;

        return service;

        /**
         * @function
         * @memberof servicesjs.UserService
         * @returns {object} - All the users' info.
         * @description This function is responsible for returning all the registered users' info in 
         * the devices local storage.
         */
        function GetAll() {
            var deferred = $q.defer();
            deferred.resolve(getUsers());
            return deferred.promise;
        }


        /**
         * @function
         * @memberof servicesjs.UserService
         * @returns {string} - The currently logged in user's username
         * @description This function is responsible for returning the username of the currently logged in user.
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
         * @param {object} user - The new user's profile details
         * @return {promise} - Success if the profile was created / Failure if not
         * @description This function is responsible for searching the usernames registered so far in the app 
         * to check if the new profile's username is not already registered. If not then a new profile is created 
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
         * @param {object} user - The user's updated profile details
         * @return {promise} - Success if the profile was updated / Failure if not
         * @description This function is responsible for searching to find the given user's profile details and 
         * update them with the new given details. If the process is successful then a success promise is returned,
         * else a failed promise is returned.
         */
        function Update(user) {
            var deferred = $q.defer();

            var users = getUsers();
            for (var i = 0; i < users.length; i++) {
                if (users[i].id === user.id) {
                    users[i] = user;
                    break;
                }
            }
            setUsers(users);
            $rootScope.globals.currentUser.username = user.username;
            deferred.resolve({ success: true });

            return deferred.promise;
        }

        // private functions

        /**
         * @function
         * @memberof servicesjs.UserService
         * @return {object} - A json object with all the users' profile details
         * @description This function is responsible for retrieving and returning all the users' profile details.
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
         * @param {object} users - All the users' profile details
         * @description This function is responsible for storing the users' profile details in the local storage.  
         */
        function setUsers(users) {
            localStorage.users = JSON.stringify(users);
        }

    }])

    /**
     * @module AuthenticationService
     * @memberof servicesjs
     * @description Factory that works like an offline user service.
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
             * @param {string} username - The user's username
             * @param {string} password - The user's password
             * @param {string} callback - The response back to the caller
             * @description This function is responsible for searching all the users' profiles to find the 
             * matching username in the users' list. If the username is not found then a failure callback is returned. 
             * Else if the username is found, then it checks if the password matches. If it does, it returns a success callback. 
             * If not, then it returns a failure callback. Also, it updates the logged in user's profile value: firstTime, in order 
             * to keep track if this is the first time a user is logging in. 
             */
            function Login(username, password, callback) {
                $timeout(function () {
                    var response;
                    UserService.GetByUsername(username)
                        .then(function (user) {
                            if (user !== null && user.password === password) {
                                response = { success: true, firstTime: user.firstTime };
                            } else {
                                response = { success: false, message: 'Username or password is incorrect' };
                            }
                            $rootScope.activeUser = user;
                            callback(response);
                            if (user !== null && user.firstTime) {
                                //TODO: FIX HERE THE FIRST TIME THING
                                user.firstTime = false;
                                UserService.Update(user);
                            }
                        });
                }, 0);
            }

            /**
             * @function
             * @memberof servicesjs.AuthenticationService
             * @param {string} username - The user's username
             * @param {string} password - The user's password
             * @description This function is responsible for setting the logged in user's username and password 
             * in global view.
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
             * @description This function is responsible for clearing the global username and password values.
             */
            function ClearCredentials() {
                $rootScope.globals = {
                    currentUser: {}
                };
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
                        console.log("went online");
                    });

                    $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                        console.log("went offline");
                    });

                } else {

                    window.addEventListener("online", function (e) {
                        console.log("went online");
                    }, false);

                    window.addEventListener("offline", function (e) {
                        console.log("went offline");
                    }, false);
                }
            }
        }
    });