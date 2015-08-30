App
.controller('tablesCtrl', function($rootScope, Table, $ionicTabsDelegate, $timeout, lodash, $ionicLoading) {
  $rootScope.locations = null;
  $rootScope.tables    = null;

  $rootScope.reload = function(){
    $ionicTabsDelegate.select(0);
    getTables($rootScope.locations[0].name);
  };

  $rootScope.init = function(){
    Table.getLocations().then(function(res){
      $rootScope.locations = res.tableLocations;
      $timeout(function(){
        $ionicTabsDelegate.select(0);
        if ($rootScope.locations.length > 0){
          getTables($rootScope.locations[0].name);
        }
      }, 10);
    });
  };

  $rootScope.selectTabWithIndex = function(index, location) {
    $ionicTabsDelegate.select(index);
    getTables(location);
  };

  var getTables = function(location){
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner> <span class="spinner-text">Loading...</span>'
    });
    Table.byLocation(location).then(function(res){
      $rootScope.tables = lodash.chunk(res.tables, 4);
      $ionicLoading.hide();
    });
  };
})
.controller('tableViewCtrl', function($scope) {
  $scope.onTableClick = function(id){
    console.log(id);
  };
})