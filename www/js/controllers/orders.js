App
.controller('ordersCtrl', function($scope, $rootScope, $ionicPopup, lodash, $state) {
  $scope.initial = function(){
  };

  console.log($rootScope.order);

  $scope.backPressed = function(){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirm cancel order',
      template: 'Data not saved, are you sure to cancel order?',
      okType: 'button-yellow',
      okText: '<b>Confirm</b>'
    });
    confirmPopup.then(function(res) {
      if(res) {
        $state.go('app.restrict.tables.index');
      }
    });
  };
})