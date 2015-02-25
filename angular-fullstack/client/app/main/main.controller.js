'use strict';

angular.module('test1App')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.foods = [
      {name: 'Jajo kurze klasa wagowa L', calories: 139, proteins: 12.5, carbs: 0.6, fat: 9.7},
      {name: 'Masło', calories: 735, proteins: 0.7, carbs: 0.7, fat: 82.5}
    ];

    $scope.eaten = [];

    $http.get('/api/things').success(function (awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function () {
      if ($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', {name: $scope.newThing});
      $scope.newThing = '';
    };

    $scope.deleteThing = function (thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
