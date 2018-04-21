angular
    .module("app.controllers")

    /**
     * @module statisticsCtrl
     * @memberof controllerjs
     * @description Controller for the functionalities implemented for the statistics view.
     */
    .controller("statisticsCtrl", ["$scope", "$q", "Server", "$http", "ConnectionMonitor", "$window",
        function ($scope, $q, Server, $http, ConnectionMonitor, $window) {
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
            $scope.selectSource = [];
            $scope.isRequestOneSource = -1;
            $scope.stat = {
                selectedStatistic: 0,
                selectedSource: 0
            }
            var requests = [];
            var data = {};

            /**
             * @name $ionic.on.beforeEnter
             * @memberof controllerjs.statisticsCtrl
             * @description Executes actions before this page is loaded into view.
             *  Actions taken: 1) Gets the nightmode setting value in order to set the page to nightmode
             *           2) Gets the font size selected by the user in order to set it to the whole page
             */
            $scope.$on("$ionicView.beforeEnter", function () {
                var n = JSON.parse($window.sessionStorage.getItem("isNightmode"));
                if (n != undefined)
                    $scope.isNightmode = n;
                data.fontsize = JSON.parse($window.sessionStorage.getItem("fontsize"));
                getFontSize();
            });

            init();

            /**
             * @function
             * @memberof controllerjs.statisticsCtrl
             * @description Sets 2 scope variables that represent 2 different font-sizes. These variables
             * are used in the page as ng-style attributes. 
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
              * @description Sets the appropriate background class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode 
              * background.
              */
            $scope.getBackgroundClass = function () {
                return $scope.isNightmode ? "nightmodeBackground" : "normalmodeBackground";
            };

            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description Sets the appropriate font color class in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getFontClass = function () {
                return $scope.isNightmode ? "nightmodeFontColor" : "normalBlackLetters";
            };

            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description Sets the appropriate font style class for headers in a scope variable that will be used 
              * in the page as ng-class attribute. The classes are either for nightmode or normal mode
              * font-color.
              */
            $scope.getNightmodeHeaderClass = function () {
                return $scope.isNightmode ? "nightmodeHeaderClass" : "normalHeaderClass";
            };

            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description Responsible for initialization of the selection dropdowns and the graphs' options.
              */
            function setGraphOptions() {
                $scope.selectSource = [{ name: "All Sources", id: 0 }];
                $scope.viewStatistics = [{ name: "Report", id: 0 }, { name: "Click", id: 1 }, { name: "Sentiment Analysis", id: 2 }];
                $scope.barLbls = [];
                $scope.barSeries = [];
                $scope.barData = [];
                $scope.allSourcesOptions = {
                    scales: {
                        yAxes: [{
                            labelFontColor: "#86B402",
                            type: 'linear',
                            display: true,
                            position: 'left',
                            ticks: {
                                callback: function (value) { if (Number.isInteger(value)) { return value; } },
                                fontColor: $scope.isNightmode ? 'white' : 'black'
                            }
                        }],
                        xAxes: [{
                            categoryPercentage: 1,
                            barPercentage: 0.8,
                            ticks: {
                                autoSkip: false,
                                maxRotation: 0,
                                minRotation: 0,
                                fontColor: $scope.isNightmode ? 'white' : 'black'
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
                    },
                    tooltips: {
                        callbacks: {
                            title: function (tooltipItem, data) {
                                var title = tooltipItem[0].xLabel + ": " + data.datasets[0].data[tooltipItem[0].index];
                                return title;
                            },
                            label: function (tooltipItem, data) {
                                return;
                            },
                        }
                    }
                };
                $scope.sourceOptions = {
                    scales: {
                        yAxes: [{
                            ticks: {
                                callback: function (value) { if (Number.isInteger(value)) { return value; } },
                                fontColor: $scope.isNightmode ? 'white' : 'black'
                            }
                        }],
                        xAxes: [{
                            categoryPercentage: 1,
                            barPercentage: 0.8,
                            ticks: {
                                autoSkip: false,
                                maxRotation: 0,
                                minRotation: 0,
                                fontColor: $scope.isNightmode ? 'white' : 'black'
                            }
                        }]
                    },
                    responsive: false,
                    tooltips: {
                        callbacks: {
                            title: function (tooltipItem, data) {
                                var title = tooltipItem[0].xLabel + ": " + data.datasets[0].data[tooltipItem[0].index];
                                return title;
                            },
                            label: function (tooltipItem, data) {
                                return;
                            },
                        }
                    }
                };
            }

            /**
              * @function
              * @memberof controllerjs.statisticsCtrl
              * @description Responsible for calling all the functions and executing necessary functionalities 
              * once the page is loaded.
              * Such functionalities include: 
              * 1) Initialize the graphs' options
              * 2) Executes a request to the server to get all the sources.
              * 3) Adds the sources in the sources dropdown selection.
              */
            function init() {
                setGraphOptions();
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
              * @description Responsible for executing a request to the server in order to retrieve the requested
              * statistics information. When the response is retrieved, it adds the response values to the chart data
              * and also creates the chart's labels according to the request.
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
                    $scope.isRequestOneSource = 0;
                } else {
                    requests.push($http.get(Server.baseUrl + 'sources/' + $scope.selectSource[$scope.stat.selectedSource].name + '/report/'));
                    requests.push($http.get(Server.baseUrl + 'sources/' + $scope.selectSource[$scope.stat.selectedSource].name + '/click/'));
                    requests.push($http.get(Server.baseUrl + 'sources/' + $scope.selectSource[$scope.stat.selectedSource].name + '/sentimentalAnalysis/'));
                    $scope.barLbls.push("Report");
                    $scope.barLbls.push("Click");
                    $scope.barLbls.push("Sentimental\n Analysis");
                    $scope.isRequestOneSource = 1;
                }

                var tempData = [];
                $q.all(requests).then(function (res) {
                    $scope.isRequestOneSource = -1;
                    res.forEach(el => {
                        tempData.push(el.data);
                        if ($scope.stat.selectedSource == 0)
                            $scope.isRequestOneSource = 0;
                        else if ($scope.stat.selectedSource > 0)
                            $scope.isRequestOneSource = 1;
                    });
                    $scope.barData.push(tempData);
                    $scope.isLoading = false;
                }).catch(function (error) {
                    $scope.isLoading = false;
                });
            };
        }])
