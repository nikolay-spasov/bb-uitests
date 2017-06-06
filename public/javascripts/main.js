angular.module('uiTestsReportApp', ['ui.grid', 'ui.grid.pagination', 'ui.router'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state({
                name: 'home',
                templateUrl: '/javascripts/main.html',
                controller: 'resultsGridController',
                controllerAs: 'ctrl',
                url: '/:setName',
                reload: true
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
    .controller('resultsGridController', ['testResultsService', '$scope', '$state', '$stateParams', function(t, $scope, $state, $stateParams) {
        var ctrl = this;
        ctrl.data = [];
        ctrl.gridOptions = {
            columnDefs: [
                { name: 'Url', field: 'testedUrl', cellTooltip: function(row, col) { return row.entity.testedUrl; } },
                { name: 'Percentage', field: 'percentage', maxWidth: 100, },
                { name: 'Test Status', field: 'testStatus', maxWidth: 100, },
                { name: 'Dev', field: 'dev',  maxWidth: 100, enableFiltering: false,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{grid.appScope.getLink(grid, row, \'dev\')}}">Dev</a></dev>' 
                },
                { name: 'Prod', field: 'prod', maxWidth: 100, enableFiltering: false,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{grid.appScope.getLink(grid, row, \'prod\')}}">Prod</a></dev>' 
                },
                { name: 'Diff', field: 'diff', maxWidth: 100, enableFiltering: false,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{grid.appScope.getLink(grid, row, \'diff\')}}">Diff</a></dev>' 
                },
                {
                    name: 'Compare', maxWidth: 100,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="details({id: grid.appScope.getDetailUrl(grid, row)})">View</a></div>',
                    enableFiltering: false
                }
            ],
            enableFiltering: true,
            enableSorting: true,
            enablePaginationControls: true,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
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

        $scope.getDetailUrl = function(grid, row) {
            var link = row.entity['prodPath'];
            link = link.replace(/^public\/images\/screenshots\//, '');
            link = link.replace(/\/prod.png$/, '');

            return link;
        }
        
        t.getResultSets().then(function (res) {
            ctrl.resultSets = res.data;
            if (!$stateParams.setName) {
                ctrl.selectedResultSet = res.data[0];
            } else {
                ctrl.selectedResultSet = res.data.find(function(val, index) {
                    if (val === $stateParams.setName) return res.data[index];
                });
            }
        }).then(updateResultdata);

        this.changeResultSet = function() {
            updateResultdata();
            $state.go('home', { setName: ctrl.selectedResultSet });
        };

        function updateResultdata() {
            t.getData(ctrl.selectedResultSet).then(function (res) {
                ctrl.gridOptions.data = res.data;
            });
        }
    }])
    .controller('detailsController', ['$stateParams', function($stateParams) {
        var ctrl = this;

        ctrl.getImageLink = function() {
            var current = $stateParams.id;
            return 'images/screenshots/' + current; 
        }
    }])
    .service('testResultsService', ['$q', '$http', function ($q, $http) {
        this.getData = function (resultSetName) {
            var deferred = $q.defer();

            $http.get('/results/get/' + resultSetName).then(function (data) {
                deferred.resolve(data);
            }).catch(function(err) {
                deferred.reject(err);  
            });

            return deferred.promise;
        };

        this.getResultSets = function () {
            var deferred = $q.defer();

            $http.get('/results/all-sets').then(function (data) {
                deferred.resolve(data);
            }).catch(function(err) {
                deferred.reject(err);  
            });

            return deferred.promise;
        };
    }]);