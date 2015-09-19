App
.controller('tablesCtrl', function($rootScope, Table, $ionicTabsDelegate, $timeout, lodash, $ionicLoading, $ionicPlatform) {
  $rootScope.locations = null;
  $rootScope.tables    = null;
  $rootScope.order     = {};

  $ionicPlatform.registerBackButtonAction(function (event) {
    event.preventDefault(); // EDIT
    navigator.app.exitApp();
  }, 100);

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
      $rootScope.tableList = lodash.sortBy(res.tables, 'name');
      $rootScope.tables    = lodash.chunk($rootScope.tableList, 4);
      $ionicLoading.hide();
    });
  };
})
.controller('tableViewCtrl', function($timeout,$scope, $rootScope, $ionicPopup, $state, lodash, $ionicLoading, Order, $ionicActionSheet, Table) {

  var getOrder = function(id){
    if (!$rootScope.order)
      $rootScope.order = {};
    $rootScope.order.products = [];

    if (id){
      actionMenu($rootScope.order.table);
    }else{
      $state.go('app.restrict.orders');
    }
  };

  var existingOrder = function(id){
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner> <span class="spinner-text">Getting order data...</span>'
    });

    Order.get(id).then(function(res){
      $rootScope.order = res.order;
      $timeout(function(){
        $ionicLoading.hide();
        $state.go('app.restrict.orders');
      }, 10);
    }, function(){
      $state.go('app.restrict.orders');
    })
  };

  var showCustomerForm = function(){
    var customerForm =  $ionicPopup.show({
      template: '<input type="number" ng-model="$root.order.person" placeholder="pax" class="popup-form"><input type="text" placeholder="name" ng-model="$root.order.name" class="popup-form">',
      title: 'Enter customer\'s details',
      scope: $scope,
      buttons: [
        { text: 'Cancel', onTap: function(e) { return false; } },
        {
          text: '<b>Continue</b>',
          type: 'button-yellow',
          onTap: function(e) {
            if (!$rootScope.order.person) {
              //don't allow the user to close unless he enters data
              e.preventDefault();
            } else {
              return $rootScope.order.person;
            }
          }
        }
      ]
    });

    customerForm.then(function(res) {
      if (res)
        getOrder(null);
    });
  };

  $scope.onTableClick = function(id){
    $rootScope.order            = {};
    $rootScope.order.table_id   = id;
    $rootScope.order.table      = lodash.findWhere($rootScope.tableList, {id: id});
    $rootScope.order.servant_id = $rootScope.currentUser.id;
    if ($rootScope.order.table.order_id)
      getOrder($rootScope.order.table.order_id);
    else
      showCustomerForm();
  };

  var tableUtil = function(table, linkTable){
    var nm = linkTable == true ? 'Link' : 'Move';
    $rootScope.targetTable = null;
    var moveTableForm = $ionicPopup.show({
      templateUrl: 'templates/tables/list.html',
      title: nm+' table '+table.name +' to:',
      scope: $scope,
      buttons: [
        { text: 'Cancel', onTap: function(e) { return false; } },
        {
          text: '<b>Continue</b>',
          type: 'button-yellow',
          onTap: function(e) {
            if (!$rootScope.targetTable) {
              e.preventDefault();
            } else {
              return $rootScope.targetTable;
            }
          }
        }
      ]
    });

    moveTableForm.then(function(res) {
      if (res){
        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner> <span class="spinner-text">'+nm+'ing table...</span>'
        });

        if (linkTable){
          Table.link({from: table.id, to: res}).then(function(){
            $ionicLoading.hide();
            $rootScope.reload();
          });
        }else {
          Table.move({from: table.id, to: res}).then(function(){
            $ionicLoading.hide();
            $rootScope.reload();
          });
        }
      }
    });
  };

  var _actionMenu = function(table, index){
    switch(index) {
      case 1:
        tableUtil(table, false);
        break;
      case 2:
        tableUtil(table, true);
        break;
      default:
        existingOrder(table.order_id);
    }
  };

  var actionMenu = function(table){
    $ionicActionSheet.show({
       buttons: [
         { text: 'View Order' },
         { text: 'Move Table' },
         { text: 'Link Table' }
       ],
       buttonClicked: function(index) {
        _actionMenu(table, index);
        return true;
       }
     });
  };

})