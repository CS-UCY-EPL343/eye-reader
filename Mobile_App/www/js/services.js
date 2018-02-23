angular
    .module("app.services", [])

.factory("BlankFactory", [function() {}])

.service("BlankService", [function() {}])

.factory("sharedProps", [
    "$rootScope",
    function() {
        var context = [];
        var addData = function(key, value) {
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
        var getData = function(key) {
            var data = _.find(context, function(t) {
                return t.key === key;
            });
            return data;
        };
        var dataLength = function() {
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

.factory("UserService", ["$timeout", "$q", "$rootScope", function($timeout, $q, $rootScope) {
    var service = {};

    service.GetAll = GetAll;
    service.GetById = GetById;
    service.GetByUsername = GetByUsername;
    service.Create = Create;
    service.Update = Update;
    service.Delete = Delete;

    return service;

    function GetAll() {
        var deferred = $q.defer();
        deferred.resolve(getUsers());
        return deferred.promise;
    }

    function GetById(id) {
        var deferred = $q.defer();
        var filtered = _.filter(getUsers(), function(user){return user.id == id;});
        var user = filtered.length ? filtered[0] : null;
        deferred.resolve(user);
        return deferred.promise;
    }

    function GetByUsername(username) {
        var deferred = $q.defer();
        var filtered = _.filter(getUsers(), function(user){return user.username == username; });
        var user = filtered.length ? filtered[0] : null;
        deferred.resolve(user);
        return deferred.promise;
    }

    function Create(user) {
        var deferred = $q.defer();

        // simulate api call with $timeout
        $timeout(function() {
            GetByUsername(user.username)
                .then(function(duplicateUser) {
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
        deferred.resolve({success: true});

        return deferred.promise;
    }

    function Delete(id) {
        var deferred = $q.defer();

        var users = getUsers();
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (user.id === id) {
                users.splice(i, 1);
                break;
            }
        }
        setUsers(users);
        deferred.resolve();

        return deferred.promise;
    }

    // private functions

    function getUsers() {
        if (!localStorage.users) {
            localStorage.users = JSON.stringify([]);
        }

        return JSON.parse(localStorage.users);
    }

    function setUsers(users) {
        localStorage.users = JSON.stringify(users);
    }

}])

.factory('AuthenticationService', ['$http', '$rootScope', '$timeout', 'UserService',
    function($http, $rootScope, $timeout, UserService) {

        var service = {};

        service.Login = Login;
        service.SetCredentials = SetCredentials;
        service.ClearCredentials = ClearCredentials;

        return service;

        function Login(username, password, callback) {
            $timeout(function() {
                var response;
                UserService.GetByUsername(username)
                    .then(function(user) {
                        if (user !== null && user.password === password) {
                            response = { success: true, firstTime : user.firstTime };
                        } else {
                            response = { success: false, message: 'Username or password is incorrect' };
                        }
                        $rootScope.activeUser = user;
                        callback(response);
                        if (user!== null && user.firstTime){
                            user.firstTime = false;
                            UserService.Update(user);
                        }
                    });
            }, 0);
        }

        function SetCredentials(username, password) {
            var authdata = username + ':' + password;

            $rootScope.globals = {
                currentUser: {
                    username: username,
                    authdata: authdata
                }
            };

            // set default auth header for http requests
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;

            // store user details in globals cookie that keeps user logged in for 1 week (or until they logout)
            var cookieExp = new Date();
            cookieExp.setDate(cookieExp.getDate() + 7);
        }

        function ClearCredentials() {
            $rootScope.globals = {};
            $http.defaults.headers.common.Authorization = 'Basic';
        }



    }
]);