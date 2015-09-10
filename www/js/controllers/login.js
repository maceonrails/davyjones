App
.controller('loginCtrl',
  function($rootScope, $scope, $ionicLoading, $ionicPopup, $localstorage, Restangular, User, $timeout, $state, $window) {
    $scope.user = {};

    // redirect if logged in
    if ($rootScope.token != 'null' && $rootScope.token != null){
      $state.go('app.restrict.tables.index');
    }

    var errorLogin = function(message) {
      $ionicPopup.alert({
        title: 'Unable to logging in',
        content: 'Ups, '+ message,
        buttons: [
          {
            text: '<b>OK</b>',
            type: 'button-yellow',
          }
        ]
      });
    };

    $scope.login = function() {
      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner> <span class="spinner-text">Logging in...</span>'
      });
      User.authenticate($scope.user)
        .then(function(response){
          if (response.role === 'waitress' || response.role === 'captain' || response.role === 'manager'){
            $localstorage.set('token', response.token);
            $ionicLoading.hide();
            $rootScope.token = response.token;
            $timeout(function(){
              $state.go('app.restrict.tables.index', { token: response.token });
            }, 200);
          } else {
            errorLogin('Only waitress or captain can use this application.'),
            $ionicLoading.hide();
          }
        }, function(error){
          var message = '';
          if (!error.data){
            message ="Please try again later";
            $window.location.reload(true);
          }else {
            message = error.data.message;
          }
          errorLogin(message),
          $ionicLoading.hide();

        });
    };

    // checkConnection
    var checkConnection = function(){
      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner> <span class="spinner-text">Checking connection...</span>'
      });

      Restangular.oneUrl('checkConnection', 'http://'+$rootScope.serverIP+'/v1').get()
        .then(function(){}, function(err){
          if (!err.data)
            showServerIPForm();
          else {
            if (err.data.message !== 'Oops, its looking like you may have taken a wrong turn.')
              showServerIPForm();
          }
          $ionicLoading.hide();
        });
    };

    var showServerIPForm = function(){
      var serverIPForm =  $ionicPopup.show({
        template: '<input type="text" ng-model="$root.serverIP">',
        title: 'Enter Server\'s IP',
        scope: $scope,
        buttons: [
          { text: 'Cancel', onTap: function(e) {ionic.Platform.exitApp();}},
          {
            text: '<b>Save</b>',
            type: 'button-yellow',
            onTap: function(e) {
              if (!$rootScope.serverIP) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $rootScope.serverIP;
              }
            }
          }
        ]
      });

      serverIPForm.then(function(res) {
        $localstorage.set('ip', res);
        checkConnection();
      });
    };

    // checkServerIP

    if ($rootScope.serverIP === undefined || $rootScope.serverIP === 'undefined' || $rootScope.serverIP === null){
      if ($rootScope.serverIP === 'undefined')
        $rootScope.serverIP = null;
      showServerIPForm();
    }else {
      checkConnection();
    }

  });