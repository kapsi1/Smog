'use strict';

angular.module('test1App')
  .filter('toFixed', function () {
    return function (val, fixNumber) {
      fixNumber = fixNumber === undefined ? 2 : fixNumber;
      return val.toFixed(fixNumber);
    }
  })
  .filter('sum', function () {
    return function (arr, field) {
      return arr.reduce(function (previousValue, currentValue) {
        return previousValue[field] + currentValue[field];
      });
    }
  });
