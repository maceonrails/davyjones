App.factory('Product', function (Restangular) {
    return {
      get: function(order) {
        return Restangular.one('products', 'all').get();
      },
      getCategory: function(order) {
        return Restangular.one('product_categories', 'all').get();
      }
    };
  });
