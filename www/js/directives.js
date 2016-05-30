'use strict';

/* Directives */


angular.module('ppApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])

  /**
   * A directive that shows elements only when user is logged in.
   */
  .directive('ngShowAuth', ['loginService', '$timeout', function (loginService, $timeout) {
    var isLoggedIn;
    loginService.watch(function(user) {
      isLoggedIn = !!user;
    });

    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it

        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            el.toggleClass('ng-cloak', !isLoggedIn);
          }, 0);
        }

        update();
        loginService.watch(update, scope);
      }
    };
  }])

  /**
   * A directive that shows elements only when user is logged out.
   */
  .directive('ngHideAuth', ['loginService', '$timeout', function (loginService, $timeout) {
    var isLoggedIn;
    loginService.watch(function(user) {
      isLoggedIn = !!user;
    });

    return {
      restrict: 'A',
      link: function(scope, el) {
        function update() {
          el.addClass('ng-cloak'); // hide until we process it

          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            el.toggleClass('ng-cloak', isLoggedIn !== false);
          }, 0);
        }

        update();
        loginService.watch(update, scope);
      }
    };
  }])

  .directive('accessLevel', ['loginService', function(loginService) {
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
          var prevDisp = element.css('display'), userRole, accessLevel;
          $scope.user = loginService.user;
          $scope.$watch('user', function(user) {
              if(user.role)
                  userRole = user.role;
              updateCSS();
          }, true);

          attrs.$observe('accessLevel', function(al) {
              if(al) accessLevel = $scope.$eval(al);
              updateCSS();
          });

          function updateCSS() {
              if(userRole && accessLevel) {
                  if(!loginService.authorize(accessLevel, userRole))
                      element.css('display', 'none');
                  else
                      element.css('display', prevDisp);
              }
          }
        }
    }
  }])

  .directive('datetimepicker', ['dateTimePickerConfig', function (defaultConfig) {
      "use strict";

      var validateConfiguration = function (configuration) {
        var validOptions = ['startView', 'minView', 'minuteStep', 'dropdownSelector', 'weekStart'];

        for (var prop in configuration) {
          if (configuration.hasOwnProperty(prop)) {
            if (validOptions.indexOf(prop) < 0) {
              throw ("invalid option: " + prop);
            }
          }
        }

        // Order of the elements in the validViews array is significant.
        var validViews = ['minute', 'hour', 'day', 'month', 'year'];

        if (validViews.indexOf(configuration.startView) < 0) {
          throw ("invalid startView value: " + configuration.startView);
        }

        if (validViews.indexOf(configuration.minView) < 0) {
          throw ("invalid minView value: " + configuration.minView);
        }

        if (validViews.indexOf(configuration.minView) > validViews.indexOf(configuration.startView)) {
          throw ("startView must be greater than minView");
        }

        if (!angular.isNumber(configuration.minuteStep)) {
          throw ("minuteStep must be numeric");
        }
        if (configuration.minuteStep <= 0 || configuration.minuteStep >= 60) {
          throw ("minuteStep must be greater than zero and less than 60");
        }
        if (configuration.dropdownSelector !== null && !angular.isString(configuration.dropdownSelector)) {
          throw ("dropdownSelector must be a string");
        }

        if (!angular.isNumber(configuration.weekStart)) {
          throw ("weekStart must be numeric");
        }
        if (configuration.weekStart < 0 || configuration.weekStart > 6) {
          throw ("weekStart must be greater than or equal to zero and less than 7");
        }
      };

      return {
        restrict: 'E',
        require: 'ngModel',
        template: "<div class='datetimepicker'>" +
          "<table class='table-condensed'>" +
          "   <thead>" +
          "       <tr>" +
          "           <th class='left'" +
          "               data-ng-click='changeView(data.currentView, data.leftDate, $event)'" +
          "               ><i class='glyphicon glyphicon-arrow-left'/></th>" +
          "           <th class='switch' colspan='5'" +
          "               data-ng-click='changeView(data.previousView, data.currentDate, $event)'" +
          ">{{ data.title }}</th>" +
          "           <th class='right'" +
          "               data-ng-click='changeView(data.currentView, data.rightDate, $event)'" +
          "             ><i class='glyphicon glyphicon-arrow-right'/></th>" +
          "       </tr>" +
          "       <tr>" +
          "           <th class='dow' data-ng-repeat='day in data.dayNames' >{{ day }}</th>" +
          "       </tr>" +
          "   </thead>" +
          "   <tbody>" +
          "       <tr data-ng-class='{ hide: data.currentView == \"day\" }' >" +
          "           <td colspan='7' >" +
          "              <span    class='{{ data.currentView }}' " +
          "                       data-ng-repeat='dateValue in data.dates'  " +
          "                       data-ng-class='{active: dateValue.active, past: dateValue.past, future: dateValue.future}' " +
          "                       data-ng-click=\"changeView(data.nextView, dateValue.date, $event)\">{{ dateValue.display }}</span> " +
          "           </td>" +
          "       </tr>" +
          "       <tr data-ng-show='data.currentView == \"day\"' data-ng-repeat='week in data.weeks'>" +
          "           <td data-ng-repeat='dateValue in week.dates' " +
          "               data-ng-click='changeView(data.nextView, dateValue.date, $event)'" +
          "               class='day' " +
          "               data-ng-class='{active: dateValue.active, past: dateValue.past, future: dateValue.future}' >{{ dateValue.display }}</td>" +
          "       </tr>" +
          "   </tbody>" +
          "</table></div>",
        scope: {
          ngModel: "=",
          onSetTime: "="
        },
        replace: true,
        link: function (scope, element, attrs) {

          var directiveConfig = {};

          if (attrs.datetimepickerConfig) {
            directiveConfig = scope.$eval(attrs.datetimepickerConfig);
          }

          var configuration = {};

          angular.extend(configuration, defaultConfig, directiveConfig);

          validateConfiguration(configuration);

          var dataFactory = {
            year: function (unixDate) {
              var selectedDate = moment.utc(unixDate).startOf('year');
              // View starts one year before the decade starts and ends one year after the decade ends
              // i.e. passing in a date of 1/1/2013 will give a range of 2009 to 2020
              // Truncate the last digit from the current year and subtract 1 to get the start of the decade
              var startDecade = (parseInt(selectedDate.year() / 10, 10) * 10);
              var startDate = moment.utc(selectedDate).year(startDecade - 1).startOf('year');
              var activeYear = scope.ngModel ? moment(scope.ngModel).year() : 0;

              var result = {
                'currentView': 'year',
                'nextView': configuration.minView === 'year' ? 'setTime' : 'month',
                'title': startDecade + '-' + (startDecade + 9),
                'leftDate': moment.utc(startDate).subtract(9, 'year').valueOf(),
                'rightDate': moment.utc(startDate).add(11, 'year').valueOf(),
                'dates': []
              };

              for (var i = 0; i < 12; i++) {
                var yearMoment = moment.utc(startDate).add(i, 'years');
                var dateValue = {
                  'date': yearMoment.valueOf(),
                  'display': yearMoment.format('YYYY'),
                  'past': yearMoment.year() < startDecade,
                  'future': yearMoment.year() > startDecade + 9,
                  'active': yearMoment.year() === activeYear
                };

                result.dates.push(dateValue);
              }

              return result;
            },

            month: function (unixDate) {

              var startDate = moment.utc(unixDate).startOf('year');

              var activeDate = scope.ngModel ? moment(scope.ngModel).format('YYYY-MMM') : 0;

              var result = {
                'previousView': 'year',
                'currentView': 'month',
                'nextView': configuration.minView === 'month' ? 'setTime' : 'day',
                'currentDate': startDate.valueOf(),
                'title': startDate.format('YYYY'),
                'leftDate': moment.utc(startDate).subtract(1, 'year').valueOf(),
                'rightDate': moment.utc(startDate).add(1, 'year').valueOf(),
                'dates': []
              };

              for (var i = 0; i < 12; i++) {
                var monthMoment = moment.utc(startDate).add(i, 'months');
                var dateValue = {
                  'date': monthMoment.valueOf(),
                  'display': monthMoment.format('MMM'),
                  'active': monthMoment.format('YYYY-MMM') === activeDate
                };

                result.dates.push(dateValue);
              }

              return result;
            },

            day: function (unixDate) {

              var selectedDate = moment.utc(unixDate);
              var startOfMonth = moment.utc(selectedDate).startOf('month');
              var endOfMonth = moment.utc(selectedDate).endOf('month');

              var startDate = moment.utc(startOfMonth).subtract(Math.abs(startOfMonth.weekday() - configuration.weekStart), 'days');

              var activeDate = scope.ngModel ? moment(scope.ngModel).format('YYYY-MMM-DD') : '';

              var result = {
                'previousView': 'month',
                'currentView': 'day',
                'nextView': configuration.minView === 'day' ? 'setTime' : 'hour',
                'currentDate': selectedDate.valueOf(),
                'title': selectedDate.format('YYYY-MMM'),
                'leftDate': moment.utc(startOfMonth).subtract(1, 'months').valueOf(),
                'rightDate': moment.utc(startOfMonth).add(1, 'months').valueOf(),
                'dayNames': [],
                'weeks': []
              };


              for (var dayNumber = configuration.weekStart; dayNumber < configuration.weekStart + 7; dayNumber++) {
                result.dayNames.push(moment.utc().weekday(dayNumber).format('dd'));
              }

              for (var i = 0; i < 6; i++) {
                var week = { dates: [] };
                for (var j = 0; j < 7; j++) {
                  var monthMoment = moment.utc(startDate).add((i * 7) + j, 'days');
                  var dateValue = {
                    'date': monthMoment.valueOf(),
                    'display': monthMoment.format('D'),
                    'active': monthMoment.format('YYYY-MMM-DD') === activeDate,
                    'past': monthMoment.isBefore(startOfMonth),
                    'future': monthMoment.isAfter(endOfMonth)
                  };
                  week.dates.push(dateValue);
                }
                result.weeks.push(week);
              }

              return result;
            },

            hour: function (unixDate) {
              var selectedDate = moment.utc(unixDate).hour(0).minute(0).second(0);

              var activeFormat = scope.ngModel ? moment(scope.ngModel).format('YYYY-MM-DD H') : '';

              var result = {
                'previousView': 'day',
                'currentView': 'hour',
                'nextView': configuration.minView === 'hour' ? 'setTime' : 'minute',
                'currentDate': selectedDate.valueOf(),
                'title': selectedDate.format('YYYY-MMM-DD'),
                'leftDate': moment.utc(selectedDate).subtract(1, 'days').valueOf(),
                'rightDate': moment.utc(selectedDate).add(1, 'days').valueOf(),
                'dates': []
              };

              for (var i = 0; i < 24; i++) {
                var hourMoment = moment.utc(selectedDate).add(i, 'hours');
                var dateValue = {
                  'date': hourMoment.valueOf(),
                  'display': hourMoment.format('H:00'),
                  'active': hourMoment.format('YYYY-MM-DD H') === activeFormat
                };

                result.dates.push(dateValue);
              }

              return result;
            },

            minute: function (unixDate) {
              var selectedDate = moment.utc(unixDate).minute(0).second(0);

              var activeFormat = scope.ngModel ? moment(scope.ngModel).format('YYYY-MM-DD H:mm') : '';

              var result = {
                'previousView': 'hour',
                'currentView': 'minute',
                'nextView': 'setTime',
                'currentDate': selectedDate.valueOf(),
                'title': selectedDate.format('YYYY-MMM-DD H:mm'),
                'leftDate': moment.utc(selectedDate).subtract(1, 'hours').valueOf(),
                'rightDate': moment.utc(selectedDate).add(1, 'hours').valueOf(),
                'dates': []
              };

              var limit = 60 / configuration.minuteStep;

              for (var i = 0; i < limit; i++) {
                var hourMoment = moment.utc(selectedDate).add(i * configuration.minuteStep, 'minute');
                var dateValue = {
                  'date': hourMoment.valueOf(),
                  'display': hourMoment.format('H:mm'),
                  'active': hourMoment.format('YYYY-MM-DD H:mm') === activeFormat
                };

                result.dates.push(dateValue);
              }

              return result;
            },

            setTime: function (unixDate) {
              var tempDate = new Date(unixDate);
              var newDate = new Date(tempDate.getTime() + (tempDate.getTimezoneOffset() * 60000));
              if (configuration.dropdownSelector) {
                jQuery(configuration.dropdownSelector).dropdown('toggle');
              }
              if (angular.isFunction(scope.onSetTime)) {
                scope.onSetTime(newDate, scope.ngModel);
              }
              scope.ngModel = newDate;
              return dataFactory[scope.data.currentView](unixDate);
            }
          };

          var getUTCTime = function () {
            var tempDate = (scope.ngModel ? moment(scope.ngModel).toDate() : new Date());
            return tempDate.getTime() - (tempDate.getTimezoneOffset() * 60000);
          };

          scope.changeView = function (viewName, unixDate, event) {
            if (event) {
              event.stopPropagation();
              event.preventDefault();
            }

            if (viewName && (unixDate > -Infinity) && dataFactory[viewName]) {
              scope.data = dataFactory[viewName](unixDate);
            }
          };

          scope.changeView(configuration.startView, getUTCTime());

          scope.$watch('ngModel', function () {
            scope.changeView(scope.data.currentView, getUTCTime());
          });
        }
      };
    }])

  .directive('badges', [function(){
    "use strict";
    return {
      restrict: 'E',
      replace: true,
      scope: {
        layers: '=layers',
        mode: '@mode'
      },
      compile: function(element, attributes){

         return {
             pre: function(scope, element, attributes, controller){
              var childElements = element.children('g');
              var _alwaysShow = ["background", "houseplain", "roof", "window_1", "window_2", "rooflight", "shingle", "firstfloor", "door"];

               scope.layers.badgesPromise.then(function(badgesArray) {
                 if (childElements.length > 0) {
                   angular.forEach(childElements, function(el){
                     if(_alwaysShow.indexOf($(el).attr('id')) == -1) {
                      // if(scope.layers != '') {
                         if (scope.mode == 'show') {
                            $(el).attr('display', 'none');
                            if(badgesArray.indexOf($(el).attr('id')) >= 0) {
                              $(el).attr('display', 'inline');
                            }
                          } else if (scope.mode == 'hide') {
                            $(el).attr('display', 'inline');
                            if(badgesArray.indexOf($(el).attr('id')) >= 0) {
                              $(el).attr('display', 'none');
                            }
                          }
                      /* } else {
                         $(el).attr('display', 'none');
                       }*/
                     } else {
                       $(el).attr('display', 'inline');
                     }
                   })
                 }
              });
             }
         }
     },
      templateUrl: 'templates/svg-badges.html'
    };
  }])

  .directive('pickadate', ['$locale', 'pickadateUtils', 'pickadateI18n', 'dateFilter', function($locale, dateUtils, i18n, dateFilter) {
        return {
          require: 'ngModel',
          scope: {
            date: '= ',
            defaultDate: '=',
            minDate: '=',
            maxDate: '=',
            disabledDates: '='
          },
          template:
            '<div class="pickadate">' +
              '<div class="pickadate-header">' +
                '<div class="pickadate-controls">' +
                  '<a href="" class="pickadate-prev" ng-click="changeMonth(-1)" ng-show="allowPrevMonth">{{t("prev")}}</a>' +
                  '<a href="" class="pickadate-next" ng-click="changeMonth(1)" ng-show="allowNextMonth">{{t("next")}}</a>' +
                '</div>'+
                '<h3 class="pickadate-centered-heading">' +
                  '{{currentDate | date:"MMMM yyyy"}}' +
                '</h3>' +
              '</div>' +
              '<div class="pickadate-body">' +
                '<div class="pickadate-main">' +
                  '<ul class="pickadate-cell">' +
                    '<li class="pickadate-head" ng-repeat="dayName in dayNames">' +
                      '{{dayName}}' +
                    '</li>' +
                  '</ul>' +
                  '<ul class="pickadate-cell">' +
                    '<li ng-repeat="d in dates" ng-click="setDate(d)" class="{{d.className}}" ng-class="{\'pickadate-active\': date == d.date}">' +
                      '{{d.date | date:"d"}}' +
                    '</li>' +
                  '</ul>' +
                '</div>' +
              '</div>' +
            '</div>',

          link: function(scope, element, attrs, ngModel)  {
            var minDate       = scope.minDate && dateUtils.stringToDate(scope.minDate),
                maxDate       = scope.maxDate && dateUtils.stringToDate(scope.maxDate),
                disabledDates = scope.disabledDates || [],
                currentDate   = (scope.defaultDate && dateUtils.stringToDate(scope.defaultDate)) || new Date();

            scope.dayNames    = $locale.DATETIME_FORMATS['SHORTDAY'];
            scope.currentDate = currentDate;
            scope.t           = i18n.t;

            scope.render = function(initialDate) {
              initialDate = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1, 3);

              var currentMonth    = initialDate.getMonth() + 1,
                dayCount          = new Date(initialDate.getFullYear(), initialDate.getMonth() + 1, 0, 3).getDate(),
                prevDates         = dateUtils.dateRange(-initialDate.getDay(), 0, initialDate),
                currentMonthDates = dateUtils.dateRange(0, dayCount, initialDate),
                lastDate          = dateUtils.stringToDate(currentMonthDates[currentMonthDates.length - 1]),
                nextMonthDates    = dateUtils.dateRange(1, 7 - lastDate.getDay(), lastDate),
                allDates          = prevDates.concat(currentMonthDates, nextMonthDates),
                dates             = [],
                today             = dateFilter(new Date(), 'yyyy-MM-dd');

              // Add an extra row if needed to make the calendar to have 6 rows
              if (allDates.length / 7 < 6) {
                allDates = allDates.concat(dateUtils.dateRange(1, 8, allDates[allDates.length - 1]));
              }

              var nextMonthInitialDate = new Date(initialDate);
              nextMonthInitialDate.setMonth(currentMonth);

              scope.allowPrevMonth = !minDate || initialDate > minDate;
              scope.allowNextMonth = !maxDate || nextMonthInitialDate < maxDate;

              for (var i = 0; i < allDates.length; i++) {
                var className = "", date = allDates[i];

                if (date < scope.minDate || date > scope.maxDate || dateFilter(date, 'M') !== currentMonth.toString()) {
                  className = 'pickadate-disabled';
                } else if (disabledDates.indexOf(date) >= 0) {
                  className = 'pickadate-disabled pickadate-unavailable';
                } else {
                  className = 'pickadate-enabled';
                }

                if (date === today) {
                  className += ' pickadate-today';
                }

                dates.push({date: date, className: className});
              }

              scope.dates = dates;
            };

            scope.setDate = function(dateObj) {
              if (isDateDisabled(dateObj)) return;
              ngModel.$setViewValue(dateObj.date);
            };

            ngModel.$render = function () {
              var date = ngModel.$modelValue;
              if (date && (disabledDates.indexOf(date) === -1)) {
                scope.currentDate = currentDate = dateUtils.stringToDate(date);
              } else if (date) {
                // if the initial date set by the user is in the disabled dates list, unset it
                scope.setDate({});
              }
              scope.render(currentDate);
            };

            scope.changeMonth = function (offset) {
              // If the current date is January 31th, setting the month to date.getMonth() + 1
              // sets the date to March the 3rd, since the date object adds 30 days to the current
              // date. Settings the date to the 2nd day of the month is a workaround to prevent this
              // behaviour
              currentDate.setDate(1);
              currentDate.setMonth(currentDate.getMonth() + offset);
              scope.render(currentDate);
            };

            function isDateDisabled(dateObj) {
              return (/pickadate-disabled/.test(dateObj.className));
            }
          }
        };
      }])
;