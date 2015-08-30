App.factory('Table', function (Restangular, $rootScope) {
    return {
      getLocations: function() {
        return Restangular.one('tables', 'locations').get();
      },
      byLocation: function(query) {
        return Restangular.one('tables', 'search')
            .customGET('', { q: query });
      }
    };
  });
