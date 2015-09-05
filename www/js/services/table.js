App.factory('Table', function (Restangular, $rootScope) {
    return {
      getLocations: function() {
        return Restangular.one('tables', 'locations').get();
      },
      byLocation: function(query) {
        return Restangular.one('tables', 'search')
            .customGET('', { q: query });
      },
      link: function(data) {
        return Restangular.one('tables', 'linking')
          .customPOST(data, null, {}, {});
      },
      move: function(data) {
        return Restangular.one('tables', 'moving')
          .customPOST(data, null, {}, {});
      }
    };
  });
