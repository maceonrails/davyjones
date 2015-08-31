App
.controller('tablesCtrl', function($rootScope, Table, $ionicTabsDelegate, $timeout, lodash, $ionicLoading) {
  $rootScope.locations = null;
  $rootScope.tables    = null;
  $rootScope.order     = {};

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
      $rootScope.tableList = res.tables;
      $rootScope.tables    = lodash.chunk(res.tables, 4);
      $ionicLoading.hide();
    });
  };
})
.controller('tableViewCtrl', function($scope, $rootScope, $ionicPopup, $state, lodash, $ionicLoading) {

  var getOutlet = function(){
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner> <span class="spinner-text">Checking order...</span>'
    });
  };

  var showCustomerForm = function(){
    var customerForm =  $ionicPopup.show({
      template: '<input type="text" ng-model="$root.$root.order.name" class="popup-form">',
      title: 'Enter customer\'s name',
      scope: $scope,
      buttons: [
        { text: 'Cancel'},
        {
          text: '<b>Continue</b>',
          type: 'button-yellow',
          onTap: function(e) {
            if (!$rootScope.order.name) {
              //don't allow the user to close unless he enters data
              e.preventDefault();
            } else {
              return $rootScope.order.name;
            }
          }
        }
      ]
    });

    customerForm.then(function() {
      // $state.go('app.restrict.orders');
      getOutlet();
    });
  };

  $scope.onTableClick = function(id){
    $rootScope.order            = {};
    $rootScope.order.table_id   = id;
    $rootScope.order.table      = lodash.findWhere($rootScope.tableList, {id: id});
    $rootScope.order.servant_id = $rootScope.currentUser.id;
    showCustomerForm();
  };
})