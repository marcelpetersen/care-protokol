/**
 * Created by anisur on 04/09/14.
 */

ppAppCtrl.controller('CareCtrl', ['$scope', '$state', 'usersService', 'dateselectService', 'careActivitiesDataService', 'activityList', 'careEntryData', '$filter', '$timeout',
    function($scope, $state, usersService, dateselectService, careActivitiesDataService, activityList, careEntryData, $filter, $timeout) {

    // Extend scope with date selector props...
    angular.extend($scope,dateselectService);

    $scope.activityList = activityList;
    $scope.totalMinutes = 0;

    // reset all for new workflow!!
    careEntryData.setCategory();
    careEntryData.setActivity();

    // Use of this??
    $scope.careReimbursement = {
      careLevel: 1,
      reducedCompetency: true,
      amountMoney: 300,
      currency: 'euro'
    };

    $scope.gotoEditEntry = function(activityNode) {
      careEntryData.setActivity(activityNode);
      $state.go('app.care.entry', {id: activityNode.$id});
    };

    $scope.getFamilyActivities = function(unformatdate) {

        if(unformatdate != null) {
          $scope.data.date = unformatdate;
        }

        try {

            usersService.getFamilyForCurrentUser().then(
              function(familyData) {

                var familyID = familyData.$value;

                if(familyID != null || familyID != undefined) {
                  $scope.activityList =  careActivitiesDataService.getFamilyActivities(familyID, moment($scope.data.date).format('YYYY-MM-DD'));
                  // re-init
                  $scope.totalMinutes = 0;

                  $scope.activityList.$loaded().then(
                    function(list) {

                      var currentActivityDateRefPath = list.$inst().$ref().toString();

                      angular.forEach(list, function(anActivity) {

                      // add to a repository
                      careEntryData.addCareEntry(anActivity.$id, currentActivityDateRefPath);

                      // total minutes... Wrong implementation, has to be fixed
                      $scope.totalMinutes +=  moment.duration({
                                                  minutes: anActivity.minutes,
                                                  hours: anActivity.hours
                                              }).asMinutes();

                    });

                     // re-attaching watch for specific events
                    list.$watch(function(newCol){
                             console.log(newCol);
                             var _key = newCol.key;
                             if(newCol.event == 'child_added') {

                               $timeout(function(){
                                 $('#' + _key).addClass('recent-added');
                                 $timeout(function(){
                                   if($('#' + _key).hasClass('recent-added')){
                                     $('#' + _key).removeClass('recent-added');
                                   }
                                 },2000);
                               }, 500);
                             }

                           if(newCol.event == 'child_changed') {
                             $('#' + _key).addClass('recent-update');
                             $timeout(function(){
                               if($('#' + _key).hasClass('recent-update')){
                                 $('#' + _key).removeClass('recent-update');
                               }
                             }, 2000);
                           }

                           if(newCol.event == 'child_removed') {
                             $('#delNotify').show();
                             $('#mainList').addClass('recent-remove');

                             $timeout(function(){
                               $('#delNotify').fadeOut(200);
                               if($('#mainList').hasClass('recent-remove')) {
                                $('#mainList').removeClass('recent-remove');
                               }
                             }, 2000);

                           }
                         });
                    },
                    function(err){
                      console.log(err);
                    });
                }
                },

              function(err){
                console.log(err);
              }
            );


          } catch(error) {
            console.log(error);
          }
     };

    $scope.openDateDo = function() {
      $scope.openDate($scope, $scope.getFamilyActivities);
    };

    $scope.nextDayDo = function() {
      $scope.nextDay($scope.getFamilyActivities);
    };
    $scope.prevDayDo = function() {
      $scope.prevDay($scope.getFamilyActivities);
    };

    $scope.newEntry = function() {
      careEntryData.setDate($scope.getSelectedDateObject());
      $state.go('app.care.select-category');
    };

    $scope.selectCategory = function(category) {
      careEntryData.setDate($scope.getSelectedDateObject());
      careEntryData.setCategory(category);
      $state.go('app.care.category', {categoryId: category.$id});
    }

     $scope.$watch('data.date',
      function(newValue, oldValue) {
       careEntryData.setDate($scope.getSelectedDateObject());
      }
    );

    $scope.formatDate($scope.data.date, $scope.getFamilyActivities);

  }])


  .controller('CareCategoriesCtrl', ['$scope', '$parse', '$stateParams', 'firebaseSync', '$translate', '$log', 'familiesService', 'loginService', 'usersService',
    function($scope, $parse, $stateParams, firebaseSync, $translate, $log, familiesService, loginService, usersService) {
    $log.debug("entered CareCategoriesCtrl");

    var family;
    var familyCareActData;

    $scope.categories = firebaseSync.syncArray('care/categories');

    // Usage of the reusable date/category stats func.. START..
    $scope.getMinsPerCatSelDate = function(catObj){
      return $scope[catObj.$id];
    }

    // Setup dynamic scope vars
    var setCatMinsScopeVars = function(catId, minsVal) {
        $parse(catId).assign($scope, minsVal);
        // Apply it to the scope when digest not in progress
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    };

    // For the currently selected date/day
    var fetchAndSetCareMinsStats = function(catId, careStatFBArray) {
        var resMins  = careStatFBArray.reduce(
          familiesService.getFamilyCareMinsStatsCB(
          [catId],
          null,
          $scope.$parent.getSelectedDateObject(),
          $scope.$parent.getSelectedDateObject()),
        0);
        setCatMinsScopeVars(catId, resMins);
    };


    var loadCategoryMinsStats = function () {
       usersService.getFamilyForCurrentUser().then(
        function(familyData){
          if(familyData != null) {
            family = familyData.$value;
            var familyCareActData = firebaseSync.syncArray('families/' + familyData.$value + '/care/activities/date');
             $scope.categories.$loaded().then(function(categoriesData){
                  angular.forEach(categoriesData, function(value, key) {
                      familyCareActData.$loaded().then(function(_familyCareActData){
                          fetchAndSetCareMinsStats(value.$id, _familyCareActData);
                          _familyCareActData.$watch(
                            function(/*event, key, prevChild*/) {
                              fetchAndSetCareMinsStats(value.$id, _familyCareActData);
                            }
                        );
                      });
                 });
              });
          }
        },
        function(err) {
          console.log(err);
        });


    }

    $scope.$watch('$parent.data.date',
      function(newValue, oldValue) {
        loadCategoryMinsStats();
      }
    );



    // Usage of the reusable date/category stats func.. END..

    $scope.demoDay = [
      { id: 3, title: "Duschen", minutesCount: 16 }
      ,{id: 6, title: "Kämmen", minutesCount: 2}
    ];

    // try http://stackoverflow.com/questions/21309366/angularjs-ui-router-state-go-only-changin-url-in-address-bar-but-not-load
  }])

  .controller('CareCategoryCtrl', ['$scope', '$state', '$stateParams', 'firebaseSync', 'careEntryData', 'careActivitiesDataService', '$translate', '$log',
    function($scope, $state, $stateParams, firebaseSync, careEntryData, careActivitiesDataService, $translate, $log) {

    $log.debug("entered CareCategoryCtrl");

    if($stateParams.categoryId) {
      // @todo check if category exists, see https://gist.github.com/anantn/4323949

      $scope.category = firebaseSync.syncObject('care/categories/' + $stateParams.categoryId);
      $scope.action = $stateParams.action;
       //console.log($scope.category);

      switch ($scope.category.$id) {
        case 'body' :
          $scope.introText = "Zur Körperpflege gehören alle Aktivitäten der persönlichen Körperhygiene, der Zahnpflege, der Haarpflege, des Rasierens und der Blasen- und Darmentleerung.";
          break;
        case 'household' :
          $scope.introText = "Zur hauswirtschaftlichen Versorgung gehört das Einkaufen, Kochen und Spülen, das Reinigen der Wohnung, Wechseln und Waschen der Kleidung und Beheizen der Wohnung.";
          break;
        case 'nutrition' :
          $scope.introText = "Zur Ernährung gehört die mundgerechte Zubereitung und Unterstützungsleistungen bei der Aufnahme der Nahrung oder auch von Sondenkost.";
          break;
        case 'mobility' :
          $scope.introText = "Zur Mobilität gehören Aktivitäten wie das Aufstehen und Zubettgehen, An- und Auskleiden, Gehen und Treppensteigen und das Verlassen und Wiederaufsuchen der Wohnung.";
          break;
      }

      careActivitiesDataService.getActivitiesByCategory($scope.category.$id).then(function(acts){
        $scope.activities = acts;
      });

      $scope.BarChart = {
        data: [4, 2, 3,2],
        options: {
          width: 20,
          stroke: "#eee"
        }
      };

    }

    $scope.newEntry = function() {
      // If this is new so set it again!!
      if($scope.category != undefined || $scope.category != null) {
        careEntryData.setCategory($scope.category);
      }
      $state.go('app.care.select-activity');
    };

  }])

  .controller('CareActivityCtrl', ['$scope', '$state', '$stateParams', '$firebase', 'firebaseSync', 'favoriteDataService', 'loginService', 'usersService', '$translate', '$log',
    function($scope, $state, $stateParams, $firebase, firebaseSync, favoriteDataService, loginService, usersService, $translate, $log) {
      $log.debug("entered CareActivityCtrl");
      $scope.activity = firebaseSync.syncObject('care/activities/' + $stateParams.activityId);
      var _user;
      var _familyID;
      $scope.allowSave = false;

      loginService.getUser().then(function(currentLoggedInUser){
          if(currentLoggedInUser !== null) {
            _user = currentLoggedInUser.uid;
              usersService.getFamily(currentLoggedInUser).then(function(familyData) {
                _familyID = familyData.$value;
                firebaseSync.keyExists("families/" + _familyID + "/users/" + _user + "/favorites/" + $scope.activity.$id).then(function(path){
                  if(path == null) {
                    $scope.allowSave = true;
                  }
                })
              })
          }
      });

      $scope.saveFavorite = function(){
        var mFav = firebaseSync.syncData("families/" + _familyID + "/users/" + _user + "/favorites");
        // uses $set because we want only one specific favorite used only once
        mFav.$set($scope.activity.$id, {title: $scope.activity.title}).then(function(){
           $state.go('app.care.favorites');
        });
      };

    }])

  .controller('CareAddCtrl', ['$scope', '$state', '$stateParams', 'firebaseSync', '$translate', '$log', 'amMoment', 'careActivitiesDataService', 'careEntryData', function($scope, $state, $stateParams, firebaseSync, $translate, $log, amMoment, careActivitiesDataService, careEntryData) {
    $log.debug("entered CareAddCtrl");

    $scope.newEntry = careEntryData;

    $scope.newEntry.date = $stateParams.date ? $stateParams.date : $scope.newEntry.date;
    //console.log($scope.newEntry.date);

    if ($scope.newEntry.date == null) {
      $scope.newEntry.date = $stateParams.date = moment().format('YYYY-MM-DD');
    }


    if ($scope.newEntry.category == null && $scope.newEntry.activity == null) {

      // select category first, but only when not in state params linked with activity
      //$state.go('app.care.add.select-category');
    } else if ($scope.newEntry.activity == null) {
      //$state.go('app.care.add.select-activity');
    }


  }])

  .controller('CareAddCategoryCtrl', [ '$scope', '$state', '$stateParams', 'dateselectService', 'careEntryData', 'categories', '$log',
    function($scope, $state, $stateParams, dateselectService, careEntryData, categories, $log) {

    $log.debug("entered CareAddCategoryCtrl");

     // Extend scope with date selector props...
    angular.extend($scope,dateselectService);
    $scope.categories = categories;
    $scope.openDateDo = function() {
      $scope.openDate($scope);
    };
    $scope.selectCategory= function(category) {
      careEntryData.setCategory(category);
      careEntryData.setDate($scope.getSelectedDateObject());
      $state.go('app.care.select-activity');
    };
    $scope.formatDate(careEntryData.getDate());

  }])

  .controller('CareAddActivityCtrl', [ '$scope', '$state', '$stateParams', 'dateselectService', 'careEntryData', 'category', 'activities',
    function($scope, $state, $stateParams, dateselectService, careEntryData, category, activities) {

    // Extend scope with date selector props...
    angular.extend($scope,dateselectService);
    $scope.activities = activities;
    $scope.category = category;
    $scope.newEntry = careEntryData;
    $scope.openDateDo = function() {
      $scope.openDate($scope);
    };
   
    $scope.selectActivity = function(activity) {

      careEntryData.setActivity(activity);
      careEntryData.setDate($scope.getSelectedDateObject());
    
      if($stateParams.id != undefined || $stateParams.id != null) {
        $state.go('app.care.entry', {id: $stateParams.id}, {reload: true});
      } else {
        $state.go('app.care.entry');
      }

    };
    $scope.formatDate(careEntryData.getDate());

  }])

  .controller('CareAddEditEntryCtrl', [ '$scope', '$rootScope', '$state', '$stateParams', '$ionicActionSheet', '$firebase', 'firebaseSync', 'dateselectService', 'careEntryData', 'loginService', 'usersService', '$interval', '$filter', 'PRIORITY_TIMESTAMP',
    function($scope, $rootScope, $state, $stateParams, $ionicActionSheet, $firebase, firebaseSync, dateselectService, careEntryData, loginService, usersService, $interval, $filter, PRIORITY_TIMESTAMP) {

    // Extend scope with date selector props...
    angular.extend($scope,dateselectService);

    if($stateParams.id != undefined || $stateParams.id != null) {

      var selectedItemRefPath = careEntryData.getCareEntry($stateParams.id) + '/' + $stateParams.id;
      var selectedItemRef  = new Firebase(selectedItemRefPath);

       $firebase(selectedItemRef).$asObject().$loaded().then(
        function(selectedEntryObj){

          $scope.entryMode='Change';

          careEntryData.setCategory(selectedEntryObj.category);
          if(Object.keys(careEntryData.getActivity()).length == 0) {         
            careEntryData.setActivity(selectedEntryObj.activity);
          }

          if( careEntryData.getDate() != undefined || careEntryData.getDate() != null && moment(careEntryData.getDate()).isValid()) {
            $scope.allowSave = true;
          }

          $scope.anEntry =  {
            minutes: parseInt(selectedEntryObj.minutes),
            user: selectedEntryObj.user,
            hours: parseInt(selectedEntryObj.hours),
            dayslice: selectedEntryObj.dayslice,
            type: selectedEntryObj.type,
            note: selectedEntryObj.note,
            category: {
              id: careEntryData.geCategory().id,
              title: careEntryData.geCategory().title
            },
            activity: {
              id: careEntryData.getActivity().id,
              title: careEntryData.getActivity().title
            }
          };
       },
       function(err){
        console.log('err');
        console.log(err);
       });


    } else {

      $scope.anEntry =  {
        minutes: 0,
        user: null,
        hours: 0,
        dayslice: '',
        type: '',
        note: '',
        date: careEntryData.getDate(),
        category: {
          id: careEntryData.geCategory().id,
          title: careEntryData.geCategory().title
        },
        activity: {
          id: careEntryData.getActivity().id,
          title: careEntryData.getActivity().title
        }
      };
    }

    $scope.stopwatchIsRunning = false;
    $scope.showSlider = true;
    $scope.showStopwatch = false;

    var stopwatchMilliSeconds = 0;
    var elapsedMs = 0;
    var startTime;
    var timerPromise;

    $scope.days = [];
    for(var i=1;i<=31;i++)
      $scope.days.push(i);

    $scope.months = [];
    for(var i=1;i<=12;i++)
      $scope.months.push(i);

    $scope.hours = [];
    for(var i=0;i<=23;i++)
      $scope.hours.push(i);

    $scope.minutes = [];
    for(var i=0;i<=59;i++)
      $scope.minutes.push(i);

    $scope.allowSave = false;


      // refactor to use in allowSave functionz
    if(function() {
        if(
          ((careEntryData.geCategory().hasOwnProperty('$id') && careEntryData.geCategory().$id != undefined || careEntryData.geCategory().$id != null) || (careEntryData.geCategory().hasOwnProperty('id') && careEntryData.geCategory().id != undefined || careEntryData.geCategory().id != null))
          &&
          (careEntryData.geCategory().hasOwnProperty('title') && careEntryData.geCategory().title != undefined || careEntryData.geCategory().title != null)
          &&
          ((careEntryData.getActivity().hasOwnProperty('$id') && careEntryData.getActivity().$id != undefined || careEntryData.getActivity().$id != null) || (careEntryData.getActvity().hasOwnProperty('id') && careEntryData.getActivity().id != undefined || careEntryData.getActivity().id != null))
          &&
          (careEntryData.getActivity().hasOwnProperty('title') && careEntryData.getActivity().title != undefined || careEntryData.getActivity().title != null)
          &&
          ( careEntryData.getDate() != undefined || careEntryData.getDate() != null && moment(careEntryData.getDate()).isValid())
          ) {
          return true;
      } else {
        return false;
      }
    }()) {
      $scope.allowSave = true;
    }

      //We need to merge time between the 2 tabs i.e. timer and slider
    $scope.toggleTimeValue = function(viewFlag){

      if(viewFlag == 'stopwatch') {
        //Migrate minutes to stop timer;
        if ($scope.anEntry.minutes > 0 && stopwatchMilliSeconds == 0) {
          //converting to milliseconds, the unit used by timer
          stopwatchMilliSeconds = parseFloat($scope.anEntry.minutes) * 60 * 1000;
        }
      } else {
        if (stopwatchMilliSeconds > 0) {
          //currently in slider mode, so convert the milliseconds into minutes
          var intMin = parseInt(stopwatchMilliSeconds/60000);
          //check if any remainder available and if the remaining seconds greater than 30,
          // then increase the minutes by 1
          var remMin = (stopwatchMilliSeconds/1000) % 60;
          if (remMin >= 30) intMin++;
          $scope.anEntry.minutes =  intMin;
        }
      }
    }

    $scope.openDateDo = function() {      
        $scope.openDate($scope);
    };

    $scope.reduceMinutes = function() {
      if ($scope.anEntry.minutes > 0)
        $scope.anEntry.minutes--;
    };
    $scope.increaseMinutes = function() {
      if ($scope.anEntry.minutes < 60)
        $scope.anEntry.minutes++;
    };

    $scope.enableSave = function() {
      $scope.allowSave = true;
    };

    $scope.resetStopwatch = function() {
      startTime = new Date();
      stopwatchMilliSeconds = elapsedMs = 0;
    };

    $scope.startStopwatch = function() {
      if (!timerPromise) {
        $scope.stopwatchIsRunning = true;
        startTime = new Date();
        timerPromise = $interval(function() {
            var now = new Date();
            elapsedMs = now.getTime() - startTime.getTime();
        }, 31);
      }
    };

    $scope.stopStopwatch = function() {
      if (timerPromise) {
        $scope.stopwatchIsRunning = false;
        $interval.cancel(timerPromise);
        timerPromise = undefined;
        stopwatchMilliSeconds += elapsedMs;
        elapsedMs = 0;
        //merge the stopwatch time to main time
        var intMin = parseInt(stopwatchMilliSeconds/60000);
        var remMin = (stopwatchMilliSeconds/1000) % 60;
        if (remMin >= 30) intMin++;
        $scope.anEntry.minutes = intMin;
      }
    };

    $scope.getStopwatchSeconds = function() {
      return stopwatchMilliSeconds + elapsedMs;
    };

    $scope.showEntryMinutes = function() {
      return $scope.anEntry.minutes * 60 * 1000;
    };

    $scope.save = function(anEntry){
      //if($scope.entryMode=="Change") {
         
         // Edit activitiy node
      if($stateParams.id != undefined || $stateParams.id != null) {

        var dateChanged = false;

        var oldDate = careEntryData.getDate();
        if($scope.getSelectedDateObject() != oldDate) {
          careEntryData.setDate($scope.getSelectedDateObject());
          // detect date change...
          dateChanged = true;
        }

        $ionicActionSheet.show({
          titleText: '<h4>Wollen Sie die Änderungen wirklich speichern?</h4>',
          destructiveText: "Ja, die alten Werte überschreiben",
          cancelText: "Nein, nicht speichern",
          cancel: function() {
            console.log('Cancelled Override');
          },
          destructiveButtonClicked: function() {
            try {
              if(dateChanged) {

                loginService.getUser().then(function(currentLoggedInUser){
                    if(currentLoggedInUser !== null) {
                       usersService.getFamily(currentLoggedInUser).then(
                        function(familyData) {
                          var familyID = familyData.$value;

                          if(familyID !== null) {

                             // setup activity entry node...
                            var nodeDate = $filter('date')(careEntryData.getDate(), 'yyyy-MM-dd');
                           // no need to modify user
                            //anEntry.user = currentLoggedInUser.uid;

                            // activity node for families/../..
                            var activityList = firebaseSync.syncArray('families/' + familyID + '/care/activities/date/' + nodeDate);
                            activityList.$add(anEntry);
                            firebaseSync.syncObject('families/' + familyID + '/care/activities/date/' + nodeDate).$loaded().then(

                              function(dObj) {
                                dObj.$priority = (PRIORITY_TIMESTAMP - careEntryData.getDate().getTime());
                                dObj.$save();
                                //Added care activity entry log to a different date...
                                //Now removing!!
                                var selectedItemRefPath = careEntryData.getCareEntry($stateParams.id) + '/' + $stateParams.id;
                                var selectedItemRef  = new Firebase(selectedItemRefPath + "/");
                                $firebase(selectedItemRef).$remove().then(
                                  function(ref){
                                    $scope.goBack();
                                  },
                                  function(err){
                                    console.log('Error saving changes...');
                                    console.log(err);
                                  });

                              },

                              function(err) {
                                console.log(err);
                              }
                            );
                            $scope.goBack();
                          }

                        },
                        function(err) {
                            console.log(err);
                            $state.go('app.login');
                        }
                     );

                    } else {
                      console.log('No logged in user');
                      $state.go('app.login');
                    }
                  },
                  function(error){
                      console.log(error);
                      $state.go('app.login');
                  });
          } else {

            var selectedItemRefPath = careEntryData.getCareEntry($stateParams.id) + '/' + $stateParams.id;
            var selectedItemRef  = new Firebase(selectedItemRefPath + "/");
            $firebase(selectedItemRef).$set(anEntry).then(
              function(ref){
                $scope.goBack();
              },
              function(err){
                console.log('Error saving changes...');
                console.log(err);
              });

            return true;

          }
        } catch(error) {
          console.log(error);
        }



          }
        });


      } else {
        // Add activity node....

        careEntryData.setDate($scope.getSelectedDateObject());

        try {

          loginService.getUser().then(function(currentLoggedInUser){
              if(currentLoggedInUser !== null) {
                 usersService.getFamily(currentLoggedInUser).then(
                  function(familyData) {
                    var familyID = familyData.$value;

                    if(familyID !== null) {

                       // setup activity entry node...
                      var nodeDate = $filter('date')(careEntryData.getDate(), 'yyyy-MM-dd');
                      anEntry.user = currentLoggedInUser.uid;

                      // activity node for families/../..
                      var activityList = firebaseSync.syncArray('families/' + familyID + '/care/activities/date/' + nodeDate);
                      activityList.$add(anEntry);
                      firebaseSync.syncObject('families/' + familyID + '/care/activities/date/' + nodeDate).$loaded().then(

                        function(dObj) {
                          dObj.$priority = (PRIORITY_TIMESTAMP - careEntryData.getDate().getTime());
                          dObj.$save();
                        },

                        function(err) {
                          console.log(err);
                        }
                      );
                      $scope.goBack();
                    }

                  },
                  function(err) {
                      console.log(err);
                      $state.go('app.login');
                  }
               );

              } else {
                console.log('No logged in user');
                $state.go('app.login')
              }
            },
            function(error){
                console.log(error);
                $state.go('app.login')
            });

        } catch(error) {
          console.log(error);
        }
      }
    };

    $scope.reselectActivity = function() {
      
      if($stateParams.id == undefined || $stateParams.id == null) {
         $state.go("app.care.select-activity");
      } else {
        $state.go("app.care.select-activity", {id: $stateParams.id});
      }
    };

    $scope.goBack = function(){
      $state.go("app.care.dashboard");
    };

    $scope.confirmDelete = function(){
      $ionicActionSheet.show({
        titleText: '<h4>Wollen Sie den Eintrag wirklich löschen?</h4>',
        destructiveText: "Ja, Eintrag löschen",
        cancelText: "Nein, nicht löschen",
        cancel: function() {
          console.log('Cancelled Delete');
        },
        destructiveButtonClicked: function() {
          console.log('Deleted');
          var selectedItemRefPath = careEntryData.getCareEntry($stateParams.id) + '/' + $stateParams.id;
          var selectedItemRef  = new Firebase(selectedItemRefPath);
          $firebase(selectedItemRef).$remove();
          $scope.goBack();
          return true;
        }
      });

    };

    $scope.formatDate(careEntryData.getDate());


  }])



  .controller('CareFavoritesCtrl', ['$scope', '$state', '$ionicActionSheet', '$firebase', 'firebaseSync', 'loginService', 'usersService', 'favoriteDataService',
    function($scope, $state, $ionicActionSheet, $firebase, firebaseSync, loginService, usersService) {

      var _family;
      var _loggedUser;
      $scope.userFavorites = [];
      $scope.data = {
         showDelete: false
      };

    loginService.getUser().then(function(currentUser){
      if(currentUser !== null) {
        _loggedUser = currentUser.uid;
        usersService.getFamily(currentUser).then(function(famObj){
          _family = famObj.$value;
          $scope.userFavorites =  firebaseSync.syncArray("families/" + _family + "/users/" + _loggedUser + "/favorites");
        });
      }
    });

    $scope.moveItem = function(item, fromIndex, toIndex) {
      var _toIndexObj = $scope.userFavorites.$getRecord($scope.userFavorites.$keyAt(toIndex));
      var _fromIndexObj = $scope.userFavorites.$getRecord($scope.userFavorites.$keyAt(fromIndex));
      var _toIndexPriority = _toIndexObj.$priority;
      var _fromIndexPriority = _fromIndexObj.$priority;
      firebaseSync.syncObject("families/" + _family + "/users/" + _loggedUser + "/favorites/" + _toIndexObj.$id).$loaded().then(function(retObj){
        retObj.$priority = _fromIndexPriority;
        retObj.$save();
      });
      firebaseSync.syncObject("families/" + _family + "/users/" + _loggedUser + "/favorites/" + _fromIndexObj.$id).$loaded().then(function(retObj){
        retObj.$priority = _toIndexPriority;
        retObj.$save();
      });

      $scope.userFavorites.splice(fromIndex, 1);
      $scope.userFavorites.splice(toIndex, 0, item);
     };

    $scope.removeEntry = function(obj) {
       $ionicActionSheet.show({
           titleText: '<h4>Would like to remove this entry?</h4>',
           destructiveText: "Yes, please remove entry",
           cancelText: "No, do not remove",
           cancel: function() {
             console.log('Cancel delete');
             return false;
           },
           destructiveButtonClicked: function() {
             firebaseSync.syncArray('families/' + _family + '/users/' + _loggedUser + '/favorites').$loaded().then(function(ref){
               ref.$remove(ref.$indexFor(obj.$id));
             });
             return true;
           }
         });
     };

  }])


  .controller('CareAddFavoritesCtrl', ['$scope', '$state', '$ionicActionSheet', '$firebase', 'firebaseSync', 'loginService', 'usersService', 'favoriteDataService',
     function($scope, $state, $ionicActionSheet, $firebase, firebaseSync, loginService, usersService, favoriteDataService) {

      var _family;
      var _loggedUser;
      $scope.favoriteActivities = [];

     loginService.getUser().then(function(currentUser){
       if(currentUser !== null) {
         _loggedUser = currentUser.uid;
         usersService.getFamily(currentUser).then(function(famObj){
           _family = famObj.$value;
           favoriteDataService.getFavorites(_family, _loggedUser).then(function(load){
             $scope.favoriteActivities = load;
           });
         });
       }
     });

     $scope.addToFavorite = function(objKey) {
       firebaseSync.syncObject("care/activities/" + objKey).$loaded().then(function(obj) {
           var mFav = firebaseSync.syncData("families/" + _family + "/users/" + _loggedUser + "/favorites");
           mFav.$set(obj.$id, {title: obj.title}).then(function(){
               firebaseSync.syncObject("families/" + _family + "/users/" + _loggedUser + "/favorites/" + obj.$id).$loaded().then(function(newObj){
                 newObj.$priority = Date.now();
                 newObj.$save();
                 $state.go('app.care.favorites');
               });
            });
        });
     };

   }])

  .controller('CareActivitiesCtrl', ["$scope","$stateParams","careActivitiesDataService", "$timeout",
        function($scope,$stateParams,careActivitiesDataService,$timeout) {

          console.log($stateParams);

          $scope.activities =careActivitiesDataService.getActivities($stateParams.categoryId);

          $scope.BarChart = {
            data: [4, 2, 3,2],
            options: {
              width: 20,
              stroke: "#eee"
            }
          };

          $scope.doRefresh = function(){
            $timeout(function() {
                $scope.$broadcast('scroll.refreshComplete');
            }, 2000);
        };
  }])

  .controller('CareActivityEntriesCtrl', ["$scope","$stateParams","careActivitiesDataService","$timeout",
        function($scope,$stateParams,careActivitiesDataService,$timeout) {
          $scope.activity = careActivitiesDataService.getActivityWithEntry($stateParams.activityId);

          $scope.doRefresh = function(){
              $timeout(function() {
                  $scope.$broadcast('scroll.refreshComplete');
              }, 2000);
          };
    }])

  .controller('CareActivityEntryAddEditCtrl', ["$scope","$filter","$state","$stateParams","careActivitiesDataService","$ionicActionSheet","$timeout", '$interval',
    function($scope,$filter,$state,$stateParams,careActivitiesDataService,$ionicActionSheet,$timeout, $interval) {
      $scope.entryMode = $stateParams.entryId ? "Change" : "Save";
      $scope.entryId = $stateParams.entryId;
      $scope.activity = careActivitiesDataService.getActivity($stateParams.activityId);

      $scope.stopwatchIsRunning = false;
      $scope.showSlider = true;
      $scope.showStopwatch = false;

/*      window.addEventListener('native.keyboardshow', function(e) {
        console.log('Keyboard height is: ' + e.keyboardHeight);
      });*/

      window.addEventListener('native.keyboardshow', keyboardShowHandler);

      function keyboardShowHandler(e) {
        console.log("It works!");
      }

      var stopwatchMilliSeconds = 0;
      var elapsedMs = 0;
      var startTime;
      var timerPromise;

      $scope.days = [];
      for(var i=1;i<=31;i++)
        $scope.days.push(i);

      $scope.months = [];
      for(var i=1;i<=12;i++)
        $scope.months.push(i);

      $scope.hours = [];
      for(var i=0;i<=23;i++)
        $scope.hours.push(i);

      $scope.minutes = [];
      for(var i=0;i<=59;i++)
        $scope.minutes.push(i);

      if($scope.entryMode == "Change")
      {
        $scope.activity.title = $scope.activity.title+"";
        $scope.currentEntry = careActivitiesDataService.getEntry($scope.activity.id,$scope.entryId);
        $scope.allowSave = false;
      }
      else
      {
        $scope.activity.title =$scope.activity.title+"";
        $scope.currentEntry = {minutes: 0,hours: 0, datetime: new Date(), dayslice: "",type: "",note:""};
        $scope.allowSave = true;
      }

      $scope.reduceMinutes = function() {
        if ($scope.currentEntry.minutes > 0)
          $scope.currentEntry.minutes--;
      };
      $scope.increaseMinutes = function() {
        if ($scope.currentEntry.minutes < 60)
          $scope.currentEntry.minutes++;
      };
      $scope.enableSave = function() {
        $scope.allowSave = true;
      };

      $scope.toggleTimeValue = function(viewFlag){
       if(viewFlag == 'stopwatch') {
         //Migrate minutes to stop timer;
         if ($scope.currentEntry.minutes > 0) {
           //converting to milliseconds, the unit used by timer
           stopwatchMilliSeconds = parseFloat($scope.currentEntry.minutes) * 60 * 1000;
         }
       } else {
         if (stopwatchMilliSeconds > 0) {
            //currently in slider mode, so convert the milliseconds into minutes
             var intMin = parseInt(stopwatchMilliSeconds/60000);
             //check if any remainder available and if the remaining seconds greater than 30,
             // then increase the minutes by 1
             var remMin = (stopwatchMilliSeconds/1000) % 60;
             if (remMin >= 30) intMin++;
             $scope.currentEntry.minutes =  intMin;
         }
       }
     }

      $scope.resetStopwatch = function() {
        startTime = new Date();
        stopwatchMilliSeconds = elapsedMs = 0;
      };

      $scope.startStopwatch = function() {
        if (!timerPromise) {
          $scope.stopwatchIsRunning = true;
          startTime = new Date();
          timerPromise = $interval(function() {
            var now = new Date();
            //$scope.time = now;
            elapsedMs = now.getTime() - startTime.getTime();
          }, 31);
        }
      };

      $scope.stopStopwatch = function() {
        if (timerPromise) {
          $scope.stopwatchIsRunning = false;
          $interval.cancel(timerPromise);
          timerPromise = undefined;
          stopwatchMilliSeconds += elapsedMs;
          elapsedMs = 0;
          $scope.currentEntry.minutes = (stopwatchMilliSeconds/60000);
        }
      }
      $scope.getStopwatchSeconds = function() {
        return stopwatchMilliSeconds + elapsedMs;
      }

      $scope.showEntryMinutes = function() {
        return $scope.currentEntry.minutes *60 * 1000;
      }

      $scope.save=function(currentEntry){
        if($scope.entryMode=="Change")
        {
          $ionicActionSheet.show({
            titleText: '<h4>Wollen Sie die Änderungen wirklich speichern?</h4>',
            destructiveText: "Ja, die alten Werte überschreiben",
            cancelText: "Nein, nicht speichern",
            cancel: function() {
              console.log('Cancelled Override');
            },
            destructiveButtonClicked: function() {
              console.log('Entry Overwritten');
              console.log(currentEntry);
              $scope.goBack();
              return true;
            }
          });
        }
        else {
          console.log(currentEntry);
          $scope.goBack();
        }
      };

      $scope.goBack = function(){
        $state.go("app.care.entries",{activityId: $scope.activity.id});
      };

      $scope.confirmDelete = function(){

        $ionicActionSheet.show({
          titleText: '<h4>Wollen Sie den Eintrag wirklich löschen?</h4>',
          destructiveText: "Ja, Eintrag löschen",
          cancelText: "Nein, nicht löschen",
          cancel: function() {
            console.log('Cancelled Delete');
          },
          destructiveButtonClicked: function() {
            console.log('Deleted');
            $scope.goBack();
            return true;
          }
        });

      };
  }])

  .controller('CareTimelineCtrl', ['$scope', '$state', '$stateParams', '$ionicScrollDelegate', '$ionicPopup', '$ionicModal', '$filter', '$log', 'firebaseSync', 'careEntryData', 'careActivitiesDataService', 'careCategoriesDataService', 'familiesService', 'usersService', 'filterFilter', '$q', '$timeout', 'amMoment', '$translate',
    function($scope, $state, $stateParams, $ionicScrollDelegate, $ionicPopup, $ionicModal, $filter, $log, firebaseSync, careEntryData, careActivitiesDataService, careCategoriesDataService, familiesService, usersService, filterFilter, $q, $timeout, amMoment, $translate) {
      $log.debug('entered CareTimelineCtrl');

      amMoment.changeLanguage($translate.use() + '-notime');

      var _arrActivities = {};

      $scope.data = {
        startDate: null,
        endDate: null
      };

      $scope.tmp = {
        newStartDate: null,
        newEndDate: null
      };

      //Checking the date parameters, if not null set the main data and backup tmp data
      if (($stateParams.startDate != null) || ($stateParams.endDate != null) ) {
        $scope.data.startDate = new Date($stateParams.startDate);
        $scope.tmp.newStartDate = new Date($stateParams.startDate);
        $scope.data.endDate = new Date($stateParams.endDate);
        $scope.tmp.newEndDate = new Date($stateParams.endDate);
      }

      $scope.setStartDate = function() {
        /* set start date via date chooser*/
        //$scope.data.activities = [];
        // no access to child local scope in directive, so we need to redirect
        //$state.go($state.current, { startDate: '2014-09-04', endDate: null}, {reload: true});
        $ionicPopup.show({
              template: '<datetimepicker ng-model="tmp.newStartDate" datetimepicker-config="{ startView:\'day\', minView:\'day\' }"></datetimepicker>',
              title: "Date",
              scope: $scope,
              buttons: [
                { text: 'Cancel' },
                {
                  text: '<b>Set</b>',
                  type: 'button-positive',
                  onTap: function(e) {
                    //check the date selected from datepicker
                    //if the end date selected is less than the initial start date
                    //reload the page with new start
                    if (moment($scope.tmp.newStartDate) < moment($scope.tmp.newEndDate)) {
                      $scope.data.startDate = $scope.tmp.newStartDate;
                      $state.go($state.current, { startDate: $filter('date')($scope.data.endDate, 'yyyy-MM-dd'), endDate: $filter('date')($scope.data.startDate, 'yyyy-MM-dd')}, {reload: true});
                    } else {
                      $scope.tmp.newStartDate = $scope.data.startDate;
                      $scope.modal.show();
                    }
                  }
                }
              ]
          });
      };

      $scope.setEndDate = function(){
        $ionicPopup.show({
              template: '<datetimepicker ng-model="tmp.newEndDate" datetimepicker-config="{ startView:\'day\', minView:\'day\' }"></datetimepicker>',
              title: "Date",
              scope: $scope,
              buttons: [
                { text: 'Cancel' },
                {
                  text: '<b>Set</b>',
                  type: 'button-positive',
                  onTap: function(e) {
                    //check the date selected from datepicker
                    //if the end date selected is less than the initial start date
                    //reload the page with new end date
                    if (moment($scope.tmp.newStartDate) < moment($scope.tmp.newEndDate)) {
                      $scope.data.endDate = $scope.tmp.newEndDate;
                      $state.go($state.current, { startDate: $filter('date')($scope.data.endDate, 'yyyy-MM-dd'), endDate: $filter('date')($scope.data.startDate, 'yyyy-MM-dd')}, {reload: true});
                    } else {
                      $scope.tmp.newEndDate = $scope.data.endDate;
                      $scope.modal.show();
                    }
                  }
                }
              ]
          });
      };

      $scope.goToEntryEdit = function(anActivityId, activityNode, activityDateNode) {
          usersService.getFamilyForCurrentUser().then(
                function(familyData) {
                  var selectedActivityDateRefPath = firebaseSync.ref('families/' + familyData.$value + '/care/activities/date/' + activityDateNode.$id).toString();
                  careEntryData.setCategory(activityNode.category);
                  careEntryData.setActivity(activityNode.activity);
                  careEntryData.setDate(new Date(activityDateNode.$id));
                  careEntryData.addCareEntry(anActivityId, selectedActivityDateRefPath);
                  // only after setting this path do progress on to edit, as this path will be required
                  //..
                  $state.go('app.care.entry', {id: anActivityId});
            });
          
      };

      var dateHasMatch = {};
    /*$scope.getActivities = function() {
        dateHasMatch = {};
        return careActivitiesDataService.getAllFamilyActivities(family, $scope.startDate, $scope.endDate).filter(function(item) {
              var itemDoesMatch = !$scope.search || item.$id.indexOf($scope.search) > -1 ;
              //Mark this person's last name letter as 'has a match'
              if (itemDoesMatch) {
                dateHasMatch[item.$id] = true;
              }

              return itemDoesMatch;
            }).filter(function(item) {
              //Finally, re-filter all of the letters and take out ones that don't
              //have a match
              if (!dateHasMatch[item.$id]) {
                return false;
              }
              return true;
            });
      };*/

      $scope.getItemHeight = function(item){
        var len = Object.keys(item).length - 2;
        if(len < 0)
          len = 1;
        return (55 * len) + 40;
      };

      $scope.scrollToTop = function() {
        $ionicScrollDelegate.$getByHandle('timeline').scrollTop(true);
      };

      $scope.scrollToBottom = function() {
        $ionicScrollDelegate.$getByHandle('timeline').scrollBottom(true);
      };

      $scope.clearSearch = function() {
        $scope.search = '';
      };

      $scope.myfilter = function(item, dayslice) {
        return usersService.getFamilyForCurrentUser().then(
                function(familyData) {
                  return firebaseSync.syncArray('families/' + familyData.$value + '/care/activities/date/' + item.$id).$loaded();
              });
      };

    var catTimelineStat = {};
    $scope.appCareCategories = careCategoriesDataService.getCategories();
    $scope.getCatMinsTimelineStat = function(appCareCategoryId) {
     return catTimelineStat[appCareCategoryId];
    };

    var actTimelineStat = {};
    $scope.appCareActivities = careActivitiesDataService.getActivities();
    $scope.getActivityMinsTimelineStat = function(appCareActivityId) {
      return actTimelineStat[appCareActivityId];
    };

     $scope.appCareCategories.$loaded().then(function(categoriesData) {
       usersService.getFamilyForCurrentUser().then(
                function(familyData) {
                  angular.forEach(categoriesData, function(value, key) {
                      var _familyCatStatScenario = familiesService.familyStat(familyData.$value, $scope.data.endDate, $scope.data.startDate, [value.$id]);
                       _familyCatStatScenario.filter().getCategoryMins(value.$id).then(
                        function(categoryMins) {
                          catTimelineStat[value.$id] = categoryMins;
                      });
                  });
            });
     });

     $scope.appCareActivities.$loaded().then(function(activitiesData) {
       usersService.getFamilyForCurrentUser().then(
                function(familyData) {
                  angular.forEach(activitiesData, function(value, key) {
                      var _familyActStatScenario = familiesService.familyStat(familyData.$value, $scope.data.endDate, $scope.data.startDate, [value.category], [value.$id]);
                      _familyActStatScenario.filter().getActivitiesMins(value.$id, value.category).then(
                        function(activityMins) {
                           actTimelineStat[value.$id] = activityMins;
                    });
                });
            });
      });

     usersService.getFamilyForCurrentUser().then(
          function(familyData) {
              var timeBoundFamilyCareDataFBArr = careActivitiesDataService.getAllFamilyActivities(familyData.$value, $scope.data.startDate, $scope.data.endDate);
               timeBoundFamilyCareDataFBArr.$loaded().then(
                    function(arr) {
                      $scope.data.activities = arr;
                      $scope.data.startDate = arr.$keyAt(arr.length-1);
                      $scope.data.endDate = arr.$keyAt(0);

                      $scope.tmp.newStartDate = $scope.data.startDate;
                      $scope.tmp.newEndDate = $scope.data.endDate;

                     // Setting up for watch... START
                     /**
                     * This is to avoid the ng-repeat problem of 10 or more iterations
                     * Only child_changed event is available in collection repeat,
                      * hence as a work around, a array is populated. And on event
                      * we are checking the length. If the length increase it is new addition,
                      * if it decreases then it is delete. Else modification event
                     */
                      angular.forEach(arr, function(dt){
                        careActivitiesDataService.getFamilyActivityEntry(familyData.$value, dt.$id).$loaded().then(function(actAr){
                          //console.log(actAr);
                          _arrActivities[dt.$id] = actAr.length;
                        });
                      });

                      arr.$watch(function(newCol){
                         var _key = newCol.key;
                          if(newCol.event == 'child_changed') {
                            careActivitiesDataService.getFamilyActivityEntry(familyData.$value, _key).$loaded().then(function(actAr){
                              //tracking edit case
                                if(actAr.length == _arrActivities[_key]) {
                                  $('#' + _key).css('background-color', '#3333FF');
                                   $timeout(function(){
                                     $('#' + _key).css('background-color', '');
                                   }, 2000);
                                }
                                else if(actAr.length > _arrActivities[_key]) {
                                  //this is new addition
                                  _arrActivities[_key] = actAr.length;
                                  $('#' + _key).css('background-color', '#33FF33');
                                    $timeout(function(){
                                      $('#' + _key).css('background-color', '');
                                    }, 2000);
                                }
                                else if(actAr.length < _arrActivities[_key]) {
                                  //this is removal event
                                  _arrActivities[_key] = actAr.length;
                                   $('#' + _key).css('background-color', '#FF3333');
                                     $timeout(function(){
                                       $('#' + _key).css('background-color', '');
                                     }, 2000);
                                 }
                              });
                          }
                       });
                      // Setting up for watch... END
                });
        });
    

     $ionicModal.fromTemplateUrl('modal.timeline.error.html', {
               // Use our scope for the scope of the modal to keep it simple
               scope: $scope,
               // The animation we want to use for the modal entrance
               animation: 'slide-in-up'
           }).then(function(modal){
             $scope.modal = modal;
           });


  }])

  .controller('CareDifficultiesCtrl', function($scope, $state, firebaseSync, loginService, usersService, careDifficultyData, $ionicActionSheet){

      var family;
      $scope.data = {
         showDelete: false
      };

     loginService.getUser().then(function(currentUser){
       if(currentUser !== null) {
         usersService.getFamily(currentUser).then(function(famObj){
           family = famObj.$value;
           $scope.userdifficulties = careDifficultyData.getUserDifficultes(family);
         });
       }
     });

    $scope.moveItem = function(item, fromIndex, toIndex) {
      var _toIndexObj = $scope.userdifficulties.$getRecord($scope.userdifficulties.$keyAt(toIndex));
      var _fromIndexObj = $scope.userdifficulties.$getRecord($scope.userdifficulties.$keyAt(fromIndex));
      var _toIndexPriority = _toIndexObj.$priority;
      var _fromIndexPriority = _fromIndexObj.$priority;
      if (_toIndexPriority == _fromIndexPriority) {
        if(toIndex > fromIndex) {
          _toIndexPriority++;
        } else {
          _toIndexPriority--;
        }
      }
      firebaseSync.syncObject("families/" + family + "/care/difficulties/" + _toIndexObj.$id).$loaded().then(function(retObj){
        retObj.$priority = _fromIndexPriority;
        retObj.$save();
      });
      firebaseSync.syncObject("families/" + family + "/care/difficulties/" + _fromIndexObj.$id).$loaded().then(function(retObj){
        retObj.$priority = _toIndexPriority;
        retObj.$save();
      });

      $scope.userdifficulties.splice(fromIndex, 1);
      $scope.userdifficulties.splice(toIndex, 0, item);
     };

    $scope.removeEntry = function(obj) {
       $ionicActionSheet.show({
           titleText: '<h4>Would like to remove this entry?</h4>',
           destructiveText: "Yes, please remove entry",
           cancelText: "No, do not remove",
           cancel: function() {
             console.log('Cancel delete');
             return false;
           },
           destructiveButtonClicked: function() {
             firebaseSync.syncArray('families/' + family + '/care/difficulties').$loaded().then(function(ref){
               ref.$remove(ref.$indexFor(obj.$id));
             });
             return true;
           }
         });
     };
  })

  .controller('CareSelectDifficultyCtrl', function($scope, $state, firebaseSync, loginService, usersService, careDifficultyData) {
    var family;
    loginService.getUser().then(function(currentUser){
     if(currentUser !== null) {
       usersService.getFamily(currentUser).then(function(famObj){
        family = famObj.$value;
        careDifficultyData.getDifficulties(family).then(function(difArr){
          $scope.difficulties = difArr;
         });
       });
     }
     });

    $scope.selectDifficulty = function(difficulty) {
      careDifficultyData.difficulty = difficulty;
      $state.go('app.care.difficulty');
    }
  })

  .controller('CareAddEditDifficultyCtrl', function($scope, $state, $stateParams, firebaseSync, loginService, usersService, careDifficultyData, $ionicActionSheet, $ionicModal){

    var family;
    var _user;
    $scope.entryId = $stateParams.entryId;

    loginService.getUser().then(function(currentUser){

      if(currentUser !== null) {

          _user = currentUser;

          usersService.getFamily(currentUser).then(function(famObj){

            family = famObj.$value;

            if ($stateParams.entryId != undefined || $stateParams.entryId != null) {
                 $scope.entryMode = 'Change';
                 $scope.currentEntry = careDifficultyData.getDifficultEntry(family, $scope.entryId);
                 $scope.allowSave = false;
                 //get the object
               } else {
                  $scope.entryMode = 'New';
                  $scope.currentEntry = {
                   title: careDifficultyData.difficulty.title,
                   notes: "",
                   user: null,
                   changed: new Date().toISOString()
                 };
                $scope.allowSave = true;
              }
          })
        }
    });

    $ionicModal.fromTemplateUrl('modal.care.error.html', {
         // Use our scope for the scope of the modal to keep it simple
         scope: $scope,
         // The animation we want to use for the modal entrance
         animation: 'slide-in-up'
     }).then(function(modal){
       $scope.modal = modal;
     });

    $scope.enableSave = function() {
      $scope.allowSave = true;
    };

    $scope.save = function(entry) {
      if($scope.entryMode == 'New') {
        var errorArr = [];
        if($scope.currentEntry.title == '' ||  careDifficultyData.difficulty.$id == null) {
         errorArr.push('difficulty');
        }
        if (errorArr.length > 0) {
            $scope.formerrors = [];
            $scope.showError = true;
            var errorKeys = careDifficultyData.getFormErrorKeys();
            angular.forEach(errorArr, function(err){
              $scope.formerrors.push(errorKeys[err]);
            });
            $scope.modal.show();
        } else {
             var diffs = firebaseSync.syncData("families/" + family + "/care/difficulties");
             entry.user = _user.uid;
             diffs.$set(careDifficultyData.difficulty.$id, entry).then(function(){
                firebaseSync.syncObject("families/" + family + "/care/difficulties/" + careDifficultyData.difficulty.$id).$loaded().then(function(newObj){
                     newObj.$priority = careDifficultyData.difficulty.$priority;
                     newObj.$save();
                     $state.go("app.care.difficulties");
                });
             });
          }
      } else {
        var errorArr = [];
        if($scope.currentEntry.title == '') {
         errorArr.push('difficulty');
        }
        if (errorArr.length > 0) {
            $scope.formerrors = [];
            $scope.showError = true;
            var errorKeys = careDifficultyData.getFormErrorKeys();
            angular.forEach(errorArr, function(err){
              $scope.formerrors.push(errorKeys[err]);
            });
            $scope.modal.show();
        } else {

            $ionicActionSheet.show({
             titleText: '<h4>Wollen Sie die Änderungen wirklich speichern?</h4>',
             destructiveText: "Ja, die alten Werte überschreiben",
             cancelText: "Nein, nicht speichern",
             cancel: function() {
               console.log('Cancelled overwrite');
             },
             destructiveButtonClicked: function() {
                console.log('Difficultie overwritten');
                $scope.currentEntry.changed = new Date().toISOString();
                $scope.currentEntry.$save();
                $state.go("app.care.difficulties");
               return true;
             }
          });
        }
      }
    };

    $scope.$on('$destroy', function() {
       $scope.modal.remove();
    });
  })
;
