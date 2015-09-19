App.directive('tableButton', function(){
  // Runs during compile
  return {
    restrict: 'C',
    link: function(scope, elem) {
      var resize = function(){
        var el = angular.element(elem);
        elem.css({height: '63px'});
      }
      resize();
    }
  };
})
.filter('removeand', function() {
  return function(input) {
    return input.replace(' AND ', '&');
  };
});