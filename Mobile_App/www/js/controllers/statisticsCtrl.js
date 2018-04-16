angular
    .module("app.controllers")

    /**
     * @module statisticsCtrl
     * @memberof controllerjs
     * @description Controller controlling the functionalities implemented for the statistics view.
     */
    .controller("statisticsCtrl", ["$scope", "$q", "Server", "$http", "ConnectionMonitor", "sharedProps", "$timeout", "$window", "$rootScope",
        function ($scope, $q, Server, $http, ConnectionMonitor, sharedProps, $timeout, $window, $rootScope) {
            /*
            *  Plugin registration for charts to break labels when entering \n in a label
            */
            Chart.pluginService.register({
                beforeInit: function (chart) {
                    chart.data.labels.forEach(function (e, i, a) {
                      if (/\n/.test(e)) {
                        a[i] = e.split(/\n/)
                      }
                    })
                  }
            });
            $scope.isOnline = ConnectionMonitor.isOnline();
            $scope.isLoading = undefined;
            $scope.isLoadingOptions = undefined;
            $scope.r = -1;
            $scope.stat = {
                selectedStatistic: 0,
                selectedSource: 0
            }
            $scope.selectSource = [];
            var requests = [];
            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.statisticsCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                if (sharedProps.getData("isNightmode") != undefined) {
                    $scope.isNightmode = sharedProps.getData("isNightmode").value;
                }
                getFontSize();
            });

            init();

            /**
             * @function
             * @memberof controllerjs.statisticsCtrl
             * @description This function is responsible for retrieving the selected font size from the 
             * shared properties space and set the value into scope variables in order to be used in 
             * the page and set the page's font size.
             */
            function getFontSize() {
                //font size for normal letters
                $scope.fontsize = { 'font-size': data.fontsize + '%' }
                //font size for smaller letters than the normal ones
                $scope.fontsizeSmaller = { 'font-size': (data.fontsize - 20) + '%' }
            }

            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description This function is responsible for retrieving the class used in the background
              * in order to set the background to nightmode/lightmode.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description This function is responsible for retrieving the class used in the font style 
              * in order to set the font style to nightmode/lightmode.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description This function is responsible for retrieving the class used in the header  
              * in order to set the header to nightmode/lightmode.
              */
            $scope.getNightmodeHeaderClass = function () {
                return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
            };


            $scope.selectSource = [{ name: "All Sources", id: 0 }];
            $scope.viewStatistics = [{ name: "Report", id: 0 }, { name: "Click", id: 1 }, { name: "Sentiment Analysis", id: 2 }];

            $scope.barLbls = [];
            $scope.barSeries = [];
            $scope.barData = [];
            $scope.barDatasetOverride = [{
                yAxisID: 'y-axis-1'
            }];
            $scope.allSourcesOptions = {
                scales: {
                    yAxes: [{
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                            callback: function (value) { if (Number.isInteger(value)) { return value; } },
                            stepSize: 1
                        }
                    }],
                    xAxes: [{
                        categoryPercentage: 1,
                        barPercentage: 0.8,
                        ticks: {
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0
                        }
                    }]
                },
                responsive: false,
                animation: {
                    onComplete: function () {
                        var sourceCanvas = this.chart.ctx.canvas;
                        var copyWidth = this.chart.controller.chartArea.left - 5;
                        // the +5 is so that the bottommost y axis label is not clipped off
                        // we could factor this in using measureText if we wanted to be generic
                        var copyHeight = this.chart.controller.chartArea.bottom + 5; // 282 //this.scale.endPoint + 5;

                        var targetCtx = document.getElementById("myChartAxis").getContext("2d");
                        targetCtx.canvas.width = copyWidth;
                        //targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);

                    }
                }
            };
            $scope.sourceOptions = {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback: function (value) { if (Number.isInteger(value)) { return value; } },
                            stepSize: 1
                        }
                    }],
                    xAxes: [{
                        categoryPercentage: 1,
                        barPercentage: 0.8,
                        ticks: {
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0
                        }
                    }]
                },
                responsive: false
            };
            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description This function is responsible for calling all the functions that need to 
              * be executed when the page is initialized.
              */
            function init() {
                var usersSettings = JSON.parse($window.localStorage.getItem("usersSettings"));

                var currentUserSettings = _.find(usersSettings, function (userSettings) {
                    return userSettings.username == $rootScope.activeUser.username;
                });

                data = {
                    fontsize: currentUserSettings.settings.fontsize,
                };

                //retrieve sources
                if ($scope.isOnline) {
                    $scope.isLoadingOptions = true;
                    var tempId = 1;
                    $http.get(Server.baseUrl + "sources/").then(function (res) {
                        var sources = res.data;

                        sources.forEach(function (el) {
                            $scope.barLbls.push(el.Title);

                            $scope.selectSource.push({ name: el.Title, id: tempId });
                            tempId++;
                        })
                        $scope.isLoadingOptions = false;
                    });

                } else {
                    $scope.isLoadingOptions = false;
                }
            }

            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description This function is responsible for requesting from the server the source names and statistics based on the user's selections
              * and then it creates the options for the chart and creates the chart.
              */
            $scope.requestStatistics = function () {
                $scope.isLoading = true;
                var req = null;
                $scope.barLbls = [];
                $scope.barSeries = ['report'];
                $scope.barData = [];
                if ($scope.stat.selectedStatistic == 0)
                    req = '/report/';
                else if ($scope.stat.selectedStatistic == 1)
                    req = '/click/';
                else
                    req = '/sentimentalAnalysis/';

                requests = [];
                if ($scope.stat.selectedSource == 0) {
                    for (var i = 1; i < $scope.selectSource.length; i++) {
                        requests.push($http.get(Server.baseUrl + 'sources/' + $scope.selectSource[i].name + req));
                        $scope.barLbls.push($scope.selectSource[i].name);
                    }
                    $scope.r = 0;
                } else {
                    requests.push($http.get(Server.baseUrl + 'sources/' + $scope.selectSource[$scope.stat.selectedSource].name + '/report/'));
                    requests.push($http.get(Server.baseUrl + 'sources/' + $scope.selectSource[$scope.stat.selectedSource].name + '/click/'));
                    requests.push($http.get(Server.baseUrl + 'sources/' + $scope.selectSource[$scope.stat.selectedSource].name + '/sentimentalAnalysis/'));
                    $scope.barLbls.push("Report");
                    $scope.barLbls.push("Click");
                    $scope.barLbls.push("Sentimental\n Analysis");
                    $scope.r = 1;
                }

                var tempData = [];
                $q.all(requests).then(function (res) {
                    $scope.r = -1;
                    res.forEach(el => {
                        tempData.push(el.data);
                        console.log(el.data);
                        if ($scope.stat.selectedSource == 0)
                            $scope.r = 0;
                        else if ($scope.stat.selectedSource > 0)
                            $scope.r = 1;
                    });
                    $scope.barData.push(tempData);
                    $scope.isLoading = false;
                }).catch(function (error) {
                    $scope.isLoading = false;
                });

            };
        }])
