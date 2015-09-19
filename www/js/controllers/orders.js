App
.controller('ordersCtrl', function($scope, $rootScope, $ionicPopup, lodash, $state, $ionicPlatform,  $ionicActionSheet, User, $ionicLoading, Order) {
  $ionicPlatform.registerBackButtonAction(function (event) {
    event.preventDefault();
  }, 100);

  var reorder = function(){
    var undeleted      = $rootScope.order.products;
    var unordered      = lodash.groupBy(undeleted, 'type');
    $scope.productView = {};
    Object.keys(unordered).sort().forEach(function(key) {
      $scope.productView[key] = unordered[key];
    });
  };

  $scope.initial = function(){
    reorder();
  };

  var moveOrder = function(product){
    var moveTxt       = product.take_away == true ? 'Dine In' : 'Take Away';
    product.take_away = !product.take_away;
    product.type      = moveTxt;
    reorder();
  };

  var voidNote = function(product){
    $rootScope.voidNote = null;
    var voidNoteForm    =  $ionicPopup.show({
      template: '<textarea ng-model="$root.voidNote" placeholder="Void Note" class="popup-form"></textarea>',
      title: 'Void Note',
      buttons: [
        { text: 'Cancel', onTap: function(e) { return false; } },
        {
          text: '<b>Continue</b>',
          type: 'button-yellow',
          onTap: function(e) {
            if (!$rootScope.voidNote) {
              e.preventDefault();
            } else {
              return $rootScope.voidNote;
            }
          }
        }
      ]
    });

    voidNoteForm.then(function(res) {
      if (res){
        product.void_note = res;
        verify(product);
      }
    });
  }

  var errorLogin = function(message, product, retry) {
    $ionicPopup.alert({
      title: 'Unable to logging in',
      content: 'Ups, '+ message,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>OK</b>',
          type: 'button-yellow',
          onTap: function(){
            if (retry)
              verify(product);
          }
        }
      ]
    });
  };

  var verify = function(product){
    var verifyForm   =  $ionicPopup.show({
      templateUrl: 'templates/login/form.html',
      title: 'Verify void order',
      scope: $scope,
      buttons: [
        { text: 'Cancel', onTap: function(e) { return false; } },
        {
          text: '<b>Continue</b>',
          type: 'button-yellow',
          onTap: function(e) {
            return $rootScope.captain;
          }
        }
      ]
    });

    verifyForm.then(function(res) {
      if (res !== undefined && res !== false){
        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner> <span class="spinner-text">Verifying...</span>'
        });
        User.authenticate(res)
          .then(function(response){
            if (response.role === 'captain' || response.role === 'manager'){
              product.void    = true;
              product.void_by = response.id;
              reorder();
              $ionicLoading.hide();
            } else {
              errorLogin('Only Captain or Manager can void saved order.', product, false),
              $ionicLoading.hide();
            }
          }, function(error){
            errorLogin(error.data.message, product, true),
            $ionicLoading.hide();
          });
      }else if (res === undefined){
        product.void_note = null;
        verify(product);
      } else {
        product.void_note = null;
      }
    });
  };

  var deleteOrder = function(product){
    if (product.saved){
      voidNote(product);
    }else {
      lodash.remove(
        $rootScope.order.products, function(prd){
          return prd.id == product.id && prd.quantity == product.quantity && prd.take_away == product.take_away && prd.choice == product.choice && prd.saved != true; });
    }
    reorder();
  };

  var showCustomerForm = function(product){
    $rootScope.detail  = angular.copy(product);
    if ($rootScope.detail.note)
      $rootScope.detail.note = $rootScope.detail.note.join(',')
    var customerForm   =  $ionicPopup.show({
      templateUrl: 'templates/products/detail.html',
      title: 'Order detail for '+product.name,
      scope: $scope,
      buttons: [
        { text: 'Cancel', onTap: function(e) { return false; } },
        {
          text: '<b>Continue</b>',
          type: 'button-yellow',
          onTap: function(e) {
            return $rootScope.detail;
          }
        }
      ]
    });

    customerForm.then(function(res) {
      if (res.quantity){
        product.quantity  = res.quantity;
        product.choice    = res.choice;
        if (res.note)
          product.note  = res.note.split(',');
      }
    });
  };


  var _actionMenu = function(product, index){
    switch(index) {
      case 1:
        moveOrder(product);
        break;
      case 2:
        deleteOrder(product);
        break;
      default:
        showCustomerForm(product);
    }
  };

  $scope.actionMenu = function(product){
    var moveTxt = product.take_away == true ? 'Dine In' : 'Take Away';

    $ionicActionSheet.show({
       buttons: [
         { text: 'Edit' },
         { text: 'Move to '+ moveTxt },
         { text: 'Delete' }
       ],
       buttonClicked: function(index) {
        _actionMenu(product, index);
        return true;
       }
     });
  };

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

  $rootScope.saveOrder = function(){
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner> <span class="spinner-text">Saving order...</span>'
    });

    Order.create($rootScope.order).then(function(){
      $ionicLoading.hide();
      $state.go('app.restrict.tables.index', {reload: true});
    }, function(){
      $ionicPopup.alert({
        title: 'Unable save order',
        content: 'Ups, unable to save order, please try again or call captain.',
        buttons: [
          {
            text: '<b>OK</b>',
            type: 'button-yellow',
          }
        ]
      });
      $ionicLoading.hide();
    });
  };
})