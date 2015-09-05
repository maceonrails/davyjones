App
.controller('productsCtrl', function($rootScope, Product, $state, $ionicTabsDelegate, $timeout, lodash, $ionicLoading, $ionicScrollDelegate, $ionicPlatform) {
  $rootScope.categories   = null;
  $rootScope.productsList = null;
  $rootScope.products     = null;
  $rootScope.takeAway     = false;

  $ionicPlatform.registerBackButtonAction(function (event) {
    event.preventDefault();
  }, 100);

  $ionicLoading.show({
    template: '<ion-spinner></ion-spinner> <span class="spinner-text">Loading...</span>'
  });

  $rootScope.toggleTakeAway = function(){
    $rootScope.takeAway = !$rootScope.takeAway;
  };

  $rootScope.goBack = function(){
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner> <span class="spinner-text">Loading...</span>'
    });
    if (!$rootScope.order.products)
      $rootScope.order.products = [];

    var products = lodash.filter($rootScope.productsList, function(prd){ return prd.quantity > 0; })
    $rootScope.order.products = $rootScope.order.products.concat(products);

    $timeout(function(){
      $state.go('app.restrict.orders');
      $ionicLoading.hide();
    }, 500);
  };

  $rootScope.init = function(){
    Product.get().then(function(response){
      $rootScope.productsList = response.products;
      Product.getCategory().then(function(res){
        $rootScope.categories = res.product_categories;
        $timeout(function(){
          $ionicTabsDelegate.select(0);
          if ($rootScope.categories.length > 0){
            getProduct($rootScope.categories[0].name);
          }
          $ionicLoading.hide();
        }, 10);
      });
    });
  };

  $rootScope.selectTabWithIndex = function(index, category) {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner> <span class="spinner-text">Loading...</span>'
    });
    $ionicTabsDelegate.select(index);
    $ionicScrollDelegate.scrollTop();
    getProduct(category);
  };

  var getProduct = function(category){
    $rootScope.products = lodash.groupBy(
      lodash.filter(
        $rootScope.productsList,
        function(prd){ return prd.serv_category === category; }
      ), function(prd){return prd.serv_sub_category; });

    $timeout(function(){
      $ionicLoading.hide();
    }, 1000);
  };
})
.controller('productViewCtrl', function($scope, $rootScope, $ionicPopup, lodash, $ionicLoading) {
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
        product.take_away = angular.copy($rootScope.takeAway);
        product.type      = product.take_away === true ? 'Take Away' : 'Dine In';
        product.quantity  = res.quantity;
        product.choice    = res.choice;
        if (res.note)
          product.note    = res.note.split(',');
      }else {
        product.quantity = null;
        product.note     = null;
        product.choice   = null;
      }
    });
  };

  $scope.amountForm = function(product){
    if (!product.sold_out){
      showCustomerForm(product);
    }
  };

  $scope.showDescription = function(product){
    var desc = product.description || 'There is no description for this product';
    $ionicPopup.alert({
      title: product.name,
      content: desc,
      buttons: [
        {
          text: '<b>OK</b>',
          type: 'button-yellow',
        }
      ]
    });
  };
})