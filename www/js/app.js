// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var App = angular.module('starter', [
  'ionic',
  'starter.controllers',
  'starter.services',
  'restangular',
  'ngLodash'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})
.run(function($rootScope, $ionicLoading) {
  // display loading on change page
  $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner> <span class="spinner-text">Loading...</span>'
    });
  });

  $rootScope.$on('$stateChangeSuccess', function(){ $ionicLoading.hide(); });
  $rootScope.$on('$stateChangeError', function(){ $ionicLoading.hide(); });
})

.service('APIInterceptor', function($rootScope, $q, $injector) {
  var service = this;

  service.request = function(config) {
    if(!config.params) {
      config.params = {};
    }
    var token   = null;
    if ($rootScope.token === null || $rootScope.token === undefined){
      token = window.localStorage['token'];
    }else {
      token = $rootScope.token;
    }

    config.params.token = token;
    return config || $q.when(config);
  };

  service.responseError = function(rejection) {
    if (rejection.status === 401) {
      window.localStorage['token'] = null;
      // $injector.get('$state').transitionTo('welcome');
      return $q.reject(rejection);// return to login page
    }else {
      return $q.reject(rejection);
    }
  };

  service.response = function(response) {
    // set total data
    var total = response.data.total;
    if (total){
      $rootScope.total = total;
    }
    return response;
  };
})

.run(function($ionicPlatform, $ionicPopup) {
  // check connection on start
  $ionicPlatform.ready(function() {
    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
        $ionicPopup.alert({
          title: 'Internet Disconnected',
          content: 'The internet is disconnected on your device, please connect to Bober wifi first.'
        })
        .then(function() {
          ionic.Platform.exitApp();
        });
      }
    }
  });
})

.config(function (RestangularProvider, $httpProvider) {
  var domain = window.location.hostname;
      domain = domain === 'localhost' ? '' : domain;

  var ip = window.localStorage['ip'];

  RestangularProvider
    .setBaseUrl('http://'+ip+'/v1');

  $httpProvider.interceptors.push('APIInterceptor');
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('app', {
    url: '',
    abstract: true,
    template: '<ion-nav-view></ion-nav-view>',
    controller: 'mainCtrl'
  })

  .state('session', {
    url: '/session',
    abstract: true,
    template: '<ion-nav-view></ion-nav-view>',
    controller: 'mainCtrl'
  })

  .state('session.login', {
    url: '/login',
    templateUrl: 'templates/login/index.html',
    controller: 'loginCtrl'
  })

  .state('app.restrict', {
    url: '/restrict',
    abstract: true,
    template: '<div ng-init="$root.getUser()"></div><ion-nav-view></ion-nav-view>',
    controller: 'restrictCtrl'
  })

  // setup an abstract state for the tabs directive
  .state('app.restrict.tables', {
    url: '/tables',
    abstract: true,
    templateUrl: 'templates/tables/tables.html',
    controller: 'tablesCtrl'
  })

  // Each tab has its own nav history stack:

  .state('app.restrict.tables.index', {
    url: '/index',
    templateUrl: 'templates/tables/index.html',
    controller: 'tableViewCtrl'
  })

  .state('app.restrict.orders', {
    url: '/orders',
    templateUrl: 'templates/orders/index.html',
    controller: 'ordersCtrl'
  })

  // .state('app.restrict.tab.chats', {
  //     url: '/chats',
  //     views: {
  //       'tab-chats': {
  //         templateUrl: 'templates/tab-chats.html',
  //         controller: 'ChatsCtrl'
  //       }
  //     }
  //   })
  //   .state('app.restrict.tab.chat-detail', {
  //     url: '/chats/:chatId',
  //     views: {
  //       'tab-chats': {
  //         templateUrl: 'templates/chat-detail.html',
  //         controller: 'ChatDetailCtrl'
  //       }
  //     }
  //   })

  // .state('app.tab.account', {
  //   url: '/account',
  //   views: {
  //     'tab-account': {
  //       templateUrl: 'templates/tab-account.html',
  //       controller: 'AccountCtrl'
  //     }
  //   }
  // });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/session/login');

});
