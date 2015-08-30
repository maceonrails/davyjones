App.factory('User', function (Restangular, $rootScope) {
    return {
      authenticate: function(user) {
        return Restangular.all('sessions')
          .customPOST({'user': user}, null, {}, {});
      },
      me: function() {
        return Restangular.one('me').get();
      },
      eresto: function(page) {
        if ($rootScope.search){
          var query = {};
          angular.extend(query, {'filter[role]': 'eresto', page: page }, $rootScope.search);
          return Restangular.one('users', 'search')
            .customGET('', query);
        }else{
          return Restangular.all('users')
            .customGET('', {'filter[role]': 'eresto', page: page });
        }
      },

      getData: function(page) {
        if ($rootScope.search){
          var query = {};
          angular.extend(query, {  page: page }, $rootScope.search);
          return Restangular.one('users', 'search')
            .customGET('', query);
        }else{
          return Restangular.all('users')
            .customGET('', { page: page });
        }
      },

      save: function(user) {
        jQuery('.content-workspace > .dimmer').addClass('active');
        return Restangular.all('users')
          .customPOST({'user': user}, null, {}, {});
      },
      update: function(user) {
        jQuery('.content-workspace > .dimmer').addClass('active');
        return Restangular.one('users', user.id)
          .customPUT({'user': user}, null, {}, {});
      },
      handle422: function(errors){
        for (var error in errors){
          var title = error.charAt(0).toUpperCase() + error.slice(1);
          jQuery('#'+error)
            .after('<label class="error">' + title + ' ' + errors[error][0] + '</label>');
        }
        return true;
      }
    };
  });
