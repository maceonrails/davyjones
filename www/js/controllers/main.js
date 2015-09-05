App
.controller('mainCtrl', function($animate, $rootScope, $state, $localstorage, $ionicSideMenuDelegate, $state, $timeout) {
  $animate.enabled(false);
  $rootScope.serverIP = $localstorage.get('ip') || null;
  $rootScope.state    = $state;
  $rootScope.token    = $localstorage.get('token') || null;
  $rootScope.order    = {};

  $rootScope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $rootScope.logout = function(){
    $localstorage.set('token', null);
    delete $rootScope.token;

    $timeout(function(){
      $state.go('session.login');
    }, 200);
  }
})
.controller('restrictCtrl', function($rootScope, User, $timeout, $state) {
  $rootScope.currentUser = null;

  $rootScope.getUser = function(){
    User.me()
      .then(function(response){
        $rootScope.currentUser = response.user;
      }, function(){
       $timeout(function(){
         $state.go('session.login');
       }, 200);
      });
  };

  $rootScope.range = function(min, max, step){
    step = step || 1;
    var input = [];
    for (var i = min; i <= max; i += step) input.push(i);
    return input;
  };

})