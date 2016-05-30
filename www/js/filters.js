'use strict';

/* Directives */


angular.module('ppApp.filters', [])
  .filter('momentDuration', function() {
    return function(value, unit) {
      var m = moment.duration(value);
      switch(unit) {
        case 'seconds': return m.seconds();
        case 'minutes': return m.minutes();
        default: return m;
      }
    };
  })
  .filter('mapTypeReduceDaySlice', function() {
    
    return function (activityDetailsArr, daySlice) {
    
      return activityDetailsArr.filter(
        function(activityNode) {
          return activityNode.dayslice == daySlice;
      }).reduce(function(prev, current, index){
            var activityType = current.type;
            var activityMins = Number(current.minutes);

            if(isNaN(activityMins)) {
              activityMins = 0;
            }
            if(prev[activityType] == undefined) {
              prev[activityType] = 0;
            }
            prev[activityType] += activityMins;
            
            return prev;
      }, {});
    };
  })

  .filter('reduceDaySlice', function() {

    return function (activityDetailsArr, daySlice) {

        // console.log('reduceDaySlice!!!');
       // console.log(activityDetailsArr);
        if(activityDetailsArr != undefined && 
          activityDetailsArr != null && 
          Array.isArray(activityDetailsArr)) {

          return activityDetailsArr.filter(
            function(activityNode) {
              return activityNode.dayslice == daySlice;
          }).reduce(function(prev, current, index){
                var activityMins = Number(current.minutes);
                if(isNaN(activityMins)) {
                  activityMins = 0;
                }
                return prev + activityMins;
          }, 0);

        } else {
          return 0;
        }
      }
  })

  .filter('reduceToMins', function() {

    return function (activityDetailsArr) {

        if(activityDetailsArr != undefined && 
          activityDetailsArr != null && 
          Array.isArray(activityDetailsArr)) {

          return activityDetailsArr.reduce(function(prev, current, index){
                var activityMins = Number(current.minutes);
                if(isNaN(activityMins)) {
                  activityMins = 0;
                }
                return prev + activityMins;
          }, 0);

        } else {
          return 0;
        }
      }

  })

  .filter('reduceDaySlice2', function() {

    return function (activityDetailsArr, daySlice) {

        var _activityDetailsArr = _.toArray(activityDetailsArr)

        if(_activityDetailsArr != undefined && 
          _activityDetailsArr != null && 
          Array.isArray(_activityDetailsArr)) {

          var totalMinsPerDaySlice = 0;
          _activityDetailsArr.forEach(
            function(val, idx){
              
              if(val != undefined &&
                val != null &&
                Array.isArray(val)) {

                      var _groupByCatData = val[0].groupByCatData;
                      
                      if(_groupByCatData != undefined && 
                          _groupByCatData != null && 
                          Array.isArray(_groupByCatData)) {
                        
                          totalMinsPerDaySlice += _groupByCatData.filter(
                                              function(activityNode) {
                                               return activityNode.dayslice == daySlice;
                                             }).reduce(function(prev, current, index){
                                                  var activityMins = Number(current.minutes);
                                                  if(isNaN(activityMins)) {
                                                    activityMins = 0;
                                                  }
                                                  return prev + activityMins;
                                              }, 0);
                      } 
              }

          });

          return totalMinsPerDaySlice;

        } else {
          return 0;
        }
      }
  })

  .filter('reduceToMins2', function() {

      return function (activityDetailsArr) {

          var _activityDetailsArr = _.toArray(activityDetailsArr)

          if(_activityDetailsArr != undefined && 
            _activityDetailsArr != null && 
            Array.isArray(_activityDetailsArr)) {

            var totalMinsPerDaySlice = 0;
            _activityDetailsArr.forEach(
              function(val, idx){
                
                if(val != undefined &&
                  val != null &&
                  Array.isArray(val)) {

                        var _groupByCatData = val[0].groupByCatData;
                        
                        if(_groupByCatData != undefined && 
                            _groupByCatData != null && 
                            Array.isArray(_groupByCatData)) {
                          
                            totalMinsPerDaySlice += _groupByCatData.reduce(
                                                function(prev, current, index){
                                                    var activityMins = Number(current.minutes);
                                                    if(isNaN(activityMins)) {
                                                      activityMins = 0;
                                                    }
                                                    return prev + activityMins;
                                                }, 0);
                        } 
                }

            });

            return totalMinsPerDaySlice;

          } else {
            return 0;
          }
        }
    })

  .filter('stopWatchDisplay', function() {
    return function (value, seperator) {
      var display = '';
      if (angular.isUndefined(seperator)) seperator = ', ';
      var mo = moment.duration(value);
      var h = mo.hours();
      var m = mo.minutes();
      var s = mo.seconds();

      if (h>0) display += h + " Stunde" + ((h != 1)? display += 'n' : '') + seperator;
      if (m>0) display += m + " Minute" + ((m != 1)? display += 'n' : '') + seperator;
      if (s>0) display += s + " Sekunde" + ((s != 1)? display += 'n' : '');

      if (display == '') display ='0 Sekunden';
      return display;
    };
  })
  .filter('reverse', function() {
       return function(items) {
          return items.slice().reverse();
       };
    })
  .filter('inSlicesOf', 
    ['$rootScope',  
    function($rootScope) {
      var makeSlices = function(items, count) { 
        if (!count)            
          count = 3;
        
        if (!angular.isArray(items) && !angular.isString(items)) return items;
        
        var array = [];
        for (var i = 0; i < items.length; i++) {
          var chunkIndex = parseInt(i / count, 10);
          var isFirst = (i % count === 0);
          if (isFirst)
            array[chunkIndex] = [];
          array[chunkIndex].push(items[i]);
        }

        if (angular.equals($rootScope.arrayinSliceOf, array))
          return $rootScope.arrayinSliceOf;
        else
          $rootScope.arrayinSliceOf = array;
          
        return array;
      };
      
      return makeSlices; 
    }]
  );