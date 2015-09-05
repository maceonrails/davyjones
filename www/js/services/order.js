App.factory('Order', function (Restangular) {
    return {
      get: function(id) {
        return Restangular.all('orders').one(id, 'get').get();
      },
      create: function(order){
        return Restangular.one('orders', 'from_servant')
          .customPOST({'order': order}, null, {}, {});
      }
    };
  });
