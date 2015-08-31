App.factory('Order', function (Restangular) {
    return {
      get: function(order) {
        return Restangular.all('sessions')
          .customPOST({'user': user}, null, {}, {});
      }
    };
  });
