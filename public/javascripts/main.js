angular.module('uiTestsReportApp', ['ui.grid', 'ui.router'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state({
                name: 'home',
                templateUrl: '/javascripts/main.html',
                controller: 'resultsGridController',
                controllerAs: 'ctrl',
                url: '/'
            })
            .state({
                name: 'details',
                templateUrl: '/javascripts/details.html',
                controller: 'detailsController',
                controllerAs: 'ctrl',
                url: '/details/:id'
            });

        $urlRouterProvider.otherwise('/');
    })
    .controller('resultsGridController', ['testResultsService', '$scope', '$state', function(t, $scope, $state) {
        var ctrl = this;
        ctrl.data = [];
        ctrl.gridOptions = {
            columnDefs: [
                { name: 'Percentage', field: 'percentage' },
                { name: 'Test Status', field: 'testStatus' },
                { name: 'Dev', field: 'dev', 
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{grid.appScope.getLink(grid, row, \'dev\')}}">Dev</a></dev>' 
                },
                { name: 'Prod', field: 'prod',
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{grid.appScope.getLink(grid, row, \'prod\')}}">Prod</a></dev>' 
                },
                { name: 'Diff', field: 'diff',
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{grid.appScope.getLink(grid, row, \'diff\')}}">Diff</a></dev>' 
                },
                {
                    name: 'Compare',
                    // cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{grid.appScope.getCompareLink(grid, row)}}">Compare</a></div>' 
                    // cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{grid.appScope.compareBtnClicked(grid, row)}}">Compare</a></div>',
                    cellTemplate: '<div class="ui-grid-cell-contents"><button type="button" ng-click="grid.appScope.compareBtnClicked(grid, row, $event)">Compare</button></div>',
                    enableFiltering: false
                }
            ],
            enableFiltering: true,
            enableSorting: true,
            resizable: true,
            data: ctrl.data
        };
        ctrl.resultSets = [];
        ctrl.selectedResultSet = null;

        $scope.getLink = function (grid, row, col) {
            var link = '';
            if (col === 'dev') {
                link = row.entity['devPath'];
            } else if (col === 'prod') {
                link = row.entity['prodPath'];
            } else if (col === 'diff') {
                link = row.entity['diffPath'];
            }

            link = link.replace(/^public/, '');
            return link;
        }

        $scope.compareBtnClicked = function(grid, row, $event) {
            console.log($event);
            $event.preventDefault();

            var link = row.entity['prodPath'];
            link = link.replace(/^public\/images\/screenshots\//, '');
            link = link.replace(/\/prod.png$/, '');
            console.log('asdasdasd');

            $state.go('details', { id: link});
            //$state.go('details', { id: link });
        }
        
        t.getResultSets().then(function (res) {
            ctrl.resultSets = res.data;
            ctrl.selectedResultSet = res.data[0];
        }).then(updateResultdata);

        this.changeResultSet = function() {
            updateResultdata();
        };

        function updateResultdata() {
            t.getData(ctrl.selectedResultSet).then(function (res) {
                ctrl.gridOptions.data = res.data;
            });
        }
    }])
    .controller('detailsController', ['$stateParams', function($stateParams) {
        const ctrl = this;

        ctrl.getImageLink = function() {
            var current = $stateParams.id;
            console.log(current);
            return 'images/screenshots/' + current; 
        }

    }])
    .service('testResultsService', ['$q', '$http', function ($q, $http) {
        this.getData = function (resultSetName) {
            var deferred = $q.defer();

            $http.get('/results/' + resultSetName + '/asd').then(function (data) {
                deferred.resolve(data);
            }).catch(function(err) {
                deferred.reject(err);  
            });

            return deferred.promise;
        };

        this.getResultSets = function () {
            var deferred = $q.defer();

            $http.get('/results/sets').then(function (data) {
                deferred.resolve(data);
            }).catch(function(err) {
                deferred.reject(err);  
            });

            return deferred.promise;
        };
    }]);