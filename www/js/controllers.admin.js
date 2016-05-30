/**
 * Created by anisur on 04/09/14.
 */

ppAppCtrl.controller('AdminCtrl', ['$scope', '$ionicModal', '$ionicPopup', '$filter',
      'firebaseSync', '$state', 'Family', '$cordovaSocialSharing',
      'familiesService', 'competencyQuestionsDataService', 'careActivitiesDataService', 'usersService', 'careCategoriesDataService', 'dateFilter', 'PRIORITY_TIMESTAMP',
      '$timeout', '$translate', '_', '$q', function($scope, $ionicModal, $ionicPopup, $filter, firebaseSync, $state, Family,
                                        $cordovaSocialSharing, familiesService,
                         competencyQuestionsDataService, careActivitiesDataService, usersService, careCategoriesDataService, dateFilter, PRIORITY_TIMESTAMP, $timeout,
                         $translate, _, $q) {

      var family = 'knapp';
      $scope.data = {date: new Date().toISOString()};
      $scope.tmp = {newDate: $scope.data.date};
      $scope.caredate =  new Date();

      $scope.disabledDates = ['2013-11-19', '2013-11-30'];
      $scope.minDate = '2013-01-01';
      $scope.maxDate = '2016-12-31';
      $scope.date = '2014-09-05';
      $scope.badges = ['layer_competency', 'medication', 'layer_care'];
      $scope.popDate = false;

      $scope.$watch('data.date', function(unformattedDate){
          $scope.data.formattedDate = $filter('date')(unformattedDate, 'dd/MM/yyyy');
        });

      $ionicModal.fromTemplateUrl('modal.admin.date.html', {
           // Use our scope for the scope of the modal to keep it simple
           scope: $scope,
           // The animation we want to use for the modal entrance
           animation: 'slide-in-up',
          buttons: [
                 { text: 'Cancel' },
                 {
                   text: '<b>Save</b>',
                   type: 'button-positive',
                   onTap: function(e) {
                     $scope.data.date = $scope.tmp.newDate;
                   }
                 }
               ]
       }).then(function(modal){
         $scope.modal = modal;
       });

      $scope.openDate = function() {
        var datePopup = $ionicPopup.show({
             template: '<datetimepicker ng-model="tmp.newDate" datetimepicker-config="{ startView:\'day\', minView:\'day\' }"></datetimepicker>',
             title: "Date",
             scope: $scope,
             buttons: [
               { text: 'Cancel' },
               {
                 text: '<b>Save</b>',
                 type: 'button-positive',
                 onTap: function(e) {
                   $scope.data.date = $scope.tmp.newDate;
                 }
               }
             ]
         });
      };

      $scope.openCordovaDate = function(){
        var options = {
                  date: new Date(),
                  mode: 'date'
                };
                datePicker.show(options, function(date){
                  $scope.dob = $filter('date')(date,'longDate');
                  $scope.$apply();
                });
      };

      $scope.removeData = function () {
        /* This is a temp function will be removed */
        var ansArr = firebaseSync.syncArray('families/' + family + '/competency/answers');
        ansArr.$loaded().then(function(ansObj){
          angular.forEach(ansObj, function(value){
            ansObj.$remove(value);
          });
      //Remove the medication drugs
          var drugs = firebaseSync.syncArray('families/' + family + '/medication/drugs');
          drugs.$loaded().then(function(drugObj){
            angular.forEach(drugObj, function(val){
              drugObj.$remove(val);
            });
          });
      //Remove the tip
          var tips = firebaseSync.syncArray('families/' + family + '/tip/tips');
          tips.$loaded().then(function(tipObj){
            angular.forEach(tipObj, function(val){
              tipObj.$remove(val);
            });
          });

          $timeout(function() {
            familiesService.setSectionState('competency', 'knapp', 'initialised');
            familiesService.setSectionState('medication', 'knapp', 'initialised');
            familiesService.setSectionState('tip', 'knapp', 'initialised');
            $state.go("app.home");
          });
        });

      };

    $scope.removeCareData = function() {
      firebaseSync.syncArray('families/' + family + '/care/activities/date').$loaded().then(function(ansObj){
                angular.forEach(ansObj, function(value){

                  ansObj.$remove(value);
                });
        ansObj.$destroy();
      });
    };

    $scope.createCareEntry = function() {
      var nodeDate = $filter('date')($scope.caredate, 'yyyy-MM-dd');
      var entry1 = {minutes: 23, user: 'simplelogin:2', dayslice: 'morning', activity: {id: 'washfull', title: 'Ganzkörperwäsche'}};
      var entry2 = {minutes: 15, user: 'simplelogin:2', dayslice: 'midday', activity: {id: 'washpart', title: 'Teilwäsche'}};
      var entry3 = {minutes: 18, user: 'simplelogin:2', dayslice: 'evening', activity: {id: 'washpart', title: 'Teilwäsche'}};
      var entry4 = {minutes: 29, user: 'simplelogin:2', dayslice: 'night', activity: {id: 'washfull', title: 'Ganzkörperwäsche'}};
      var entry5 = {minutes: 13, user: 'simplelogin:2', dayslice: 'morning', activity: {id: 'washfull', title: 'Ganzkörperwäsche'}};
      var entry6 = {minutes: 28, user: 'simplelogin:2', dayslice: 'morning', activity: {id: 'washpart', title: 'Teilwäsche'}};
      var entry7 = {minutes: 29, user: 'simplelogin:2', dayslice: 'night', activity: {id: 'washfull', title: 'Ganzkörperwäsche'}};
      var entry8 = {minutes: 12, user: 'simplelogin:2', dayslice: 'evening', activity: {id: 'washpart', title: 'Teilwäsche'}};

      firebaseSync.keyExists('families/' + family + '/care/activities').then(function(retObj){
        if(retObj == null) {
          console.log('activities null');
          firebaseSync.syncArray('families/' + family + '/care/activities/date/' + nodeDate).$loaded().then(function(objArr){
            objArr.$add(entry1);
            objArr.$add(entry2);
            objArr.$add(entry3);
            objArr.$add(entry4);
            objArr.$add(entry5);
            objArr.$add(entry6);
            objArr.$add(entry7);
            objArr.$add(entry8);
            console.log('Added entries');
          });

          firebaseSync.syncObject('families/' + family + '/care/activities/date/' + nodeDate).$loaded().then(function(obj){
              obj.$priority = (PRIORITY_TIMESTAMP - $scope.caredate.getTime());
              obj.$save();
         });

        } else {

          firebaseSync.syncArray('families/' + family + '/care/activities/date/' + nodeDate).$loaded().then(function(objArr){
            objArr.$add(entry1);
            objArr.$add(entry2);
            objArr.$add(entry3);
            objArr.$add(entry4);
            objArr.$add(entry5);
            objArr.$add(entry6);
            objArr.$add(entry7);
            objArr.$add(entry8);
            console.log('Added entries');
          });

          firebaseSync.syncObject('families/' + family + '/care/activities/date/' + nodeDate).$loaded().then(function(obj){
              obj.$priority = (PRIORITY_TIMESTAMP - $scope.caredate.getTime());
              obj.$save();
         });

        }
      });
    };

    $scope.shareViaFacebook = function(message, image, link) {
      $cordovaSocialSharing
        .shareViaFacebook(message, image, link)
        .then(function(result) {
          // Success!
          console.log('Facebook');
        }, function(err) {
          // An error occured. Show a message to the user
          console.log('Facebook error');
        });
    };

    $scope.shareViaTwitter = function(message, file, link) {
      $cordovaSocialSharing.shareViaTwitter(message, file, link).then(function(result){
        console.log('Twitter');
      }, function(err){
        console.log('Twitter error');
      });
    };


    $scope.shareViaSMS = function(message, mobile) {
      $cordovaSocialSharing.shareViaSMS(message, mobile).then(function(result){
        console.log('SMS');
      }, function(err){
        console.log('SMS error');
      });
    };

    $scope.shareViaWhatsapp = function(message, file, link) {
          $cordovaSocialSharing.shareViaWhatsApp(message, file, link).then(function(result){
            console.log('Whatsapp');
          }, function(err){
            console.log('Whats app error');
          });
        };

    $scope.share = function(message, subject, file, link) {
      $cordovaSocialSharing
        .share(message, subject, file, link)
        .then(function(result) {
          // Success!
        console.log(result);
        }, function(err) {
          // An error occured. Show a message to the user
        console.log(err);
        });
      };

    $scope.users = [];

    firebaseSync.syncArray('users').$loaded().then(function(userArr){
      $scope.users = userArr;
    });

    $scope.checkCareLevel0 = function() {

      // Default number of challenges to be checked: 2
      usersService.getFamilyForCurrentUser().then(
                function(familyData) {
                  familiesService.checkCareLevel0(familyData.$value).then(function(res){
                    if(!res) {
                      console.log('Level-0 not reached, checked for at-least 2 challenges!!');
                    } else {
                      
                      console.log('Level-0 reached for sure, checked for at-least 2 challenges!!');
                      console.log('Dataset satisfying clause');
                      console.log(res);
                    }
                  });
            });

      // Check for if more than number of challenges is not default, 3 in this case
       usersService.getFamilyForCurrentUser().then(
                function(familyData) {
                  familiesService.checkCareLevel0(familyData.$value, 3).then(function(res){
                    if(!res) {
                      console.log('Level-0 not reached, checked for at-least 3 challenges!!');
                    } else {
                      
                      console.log('Level-0 reached for sure, checked for at-least 3 challenges!!');
                      console.log('Dataset satisfying clause');
                      console.log(res);
                    }
                  });
            });

       // Check for if more than number of challenges is not default, 4 in this case
       usersService.getFamilyForCurrentUser().then(
                function(familyData) {
                  familiesService.checkCareLevel0(familyData.$value, 4).then(function(res){
                    if(!res) {
                      console.log('Level-0 not reached, checked for at-least 4 challenges!!');

                    } else {
                      
                      console.log('Level-0 reached for sure, checked for at-least 4 challenges!!');
                      console.log('Dataset satisfying clause');
                      console.log(res);
                    }
                  });
            });
    };

  
    $scope.checkCareLevel1 = function() {

      // For a specific family, in this case just using current user's family
       usersService.getFamilyForCurrentUser().then(
                function(familyData) {
                  familiesService.checkCareLevel1(familyData.$value).then(function(res){
                    if(!res) {
                      console.log('Level-1 not reached!');

                    } else {
                      
                      console.log('Level-1 reached for sure!');
                      console.log('Dataset satisfying clause');
                      console.log(res);
                    }
                  });
            });

    };

    $scope.checkCareLevel2 = function() {
      usersService.getFamilyForCurrentUser().then(
                function(familyData) {
                  familiesService.checkCareLevel2(familyData.$value).then(function(res){
                    if(!res) {
                      console.log('Level-2 not reached!');

                    } else {
                      
                      console.log('Level-2 reached for sure!');
                      console.log('Dataset satisfying clause');
                      console.log(res);
                    }
                  });
            });
    };


    $scope.checkCareLevel3 = function() {
      usersService.getFamilyForCurrentUser().then(
                function(familyData) {
                  familiesService.checkCareLevel3(familyData.$value).then(function(res){
                    if(!res) {
                      console.log('Level-3 not reached!');

                    } else {
                      
                      console.log('Level-3 reached for sure!');
                      console.log('Dataset satisfying clause');
                      console.log(res);
                    }
                  });
            });
    };

     $scope.checkVariousCareLevels = function() {

        // A simple stat collection scenario!!
        var _familyStatScenario1 = familiesService.familyStat('-JVkg6AD6lMr34ykyly9', null, null, ['body', 'household', 'mobility']);
        _familyStatScenario1.filter().results().then(
            function(statRes) {
            console.log('!!! Raw & random family stat (family: \'JVkg6AD6lMr34ykyly9\'; categories: [\'body\', \'household\', \'mobility\']) !!!');
            console.log(statRes);
          });

        // Check care level-1, failure
        familiesService.checkCareLevelBasis(
          450, 
          2,
          '-JVkg6AD6lMr34ykyly9',
          null,
          null
          ).then(
          function(carelevel1res){
            console.log('Check Care Level-1 for (family: \'JVkg6AD6lMr34ykyly9\') a possible pass/fail!: ' + 450 + "mins.");
            console.log(carelevel1res);
          });


        // Check care level-1, pass??
        familiesService.checkCareLevelBasis(
          45, 
          2,
          'knapp',
          null,
          null
          ).then(
          function(carelevel1res){
            console.log('Check Care Level-1 for family \'knapp\' a possible pass/fail!: ' + 45 + "mins.");
            console.log(carelevel1res);
          });

        // Check care level-1, pass
        familiesService.checkCareLevelBasis(
          45, 
          2,
          '-JVkg6AD6lMr34ykyly9',
          null,
          null
          ).then(
          function(carelevel1res){
            console.log('Check Care Level-1 for (family: \'JVkg6AD6lMr34ykyly9\') a possible pass/fail!: ' + 45 + "mins.");
            console.log(carelevel1res);
          });

          familiesService.checkCareLevelBasis(
          45, 
          2,
          '-JVkg6AD6lMr34ykyly9',
          null,
          null,
          ['household', 'mobility', 'nutrition']
          ).then(
          function(carelevel1res){
            console.log('Check Care Level-1 for (family: \'JVkg6AD6lMr34ykyly9\'), conditions -  any 2 of the categories [\'household\', \'mobility\', \'nutrition\'], meeting a possible pass/fail!: ' + 45 + "mins.");
            console.log(carelevel1res);
          });

          familiesService.checkCareLevelBasis(
          45, 
          2,
          '-JVkg6AD6lMr34ykyly9',
          null,
          null,
          ['household', 'mobility', 'nutrition'],
          ['bedgetup', 'beddingchange']
          ).then(
          function(carelevel1res){
            console.log('Check Care Level-1 for (family: \'JVkg6AD6lMr34ykyly9\'), conditions -  any 2 of the categories [\'household\', \'mobility\', \'nutrition\'] and activities [\'bedgetup\', \'beddingchange\'] meeting a possible pass/fail!: ' + 45 + "mins.");
            console.log(carelevel1res);
          });

        // mixture of restrictions-1:
        // not so much..
        familiesService.nCkFamilyCareCatStat(
          2,
          '-JVkg6AD6lMr34ykyly9',
          null,
          null
          ).then(
          function(data){
            console.log('Get all entry combinations of 2 for all categories, family: \'JVkg6AD6lMr34ykyly9\'');
            console.log(data);

            var potentialMilestoneReached = [];
            var minutesToCalc = 45;

            data.forEach(function(val, idx) {
               // console.log('!!! val @#### ');
               // console.log(val);

                if(_.reduce(val, function(memo, catStat, index,list) {
                  if(catStat.averageMinsPerday >= minutesToCalc) {
                    // if any cat stat is more than the mins to calc 
                    // force it to quit this combo
                    return 0;
                  }
                  return memo + catStat.averageMinsPerday;
                },0) > minutesToCalc) {
                  potentialMilestoneReached.push(val);
                }

            });  

            console.log('!!! Potential milestone reached??');
            console.log(potentialMilestoneReached.length > 0 ? potentialMilestoneReached : false);         

        });

        // mixture of restrictions-2:
        // categories
        familiesService.nCkFamilyCareCatStat(
          2,
          '-JVkg6AD6lMr34ykyly9',
          null,
          null,
          ['body', 'household', 'mobility']
          ).then(
          function(data){
            console.log('Get all entry combinations of 2 from categories - [\'body\', \'household\', \'mobility\'], family: \'JVkg6AD6lMr34ykyly9\'');
            console.log(data);
        });

        // mixture of restrictions-3:
        // categories
        // activities
        familiesService.nCkFamilyCareCatStat(
          2,
          '-JVkg6AD6lMr34ykyly9',
          null,
          null,
          ['body', 'household', 'mobility'],
          ['washpart', 'cleaning', 'cooking']
          ).then(
          function(data){
            console.log('Get all entry combinations of 2 from categories - [\'body\', \'household\', \'mobility\'], activity constraints -  [\'washpart\', \'cleaning\', \'cooking\'], family: \'JVkg6AD6lMr34ykyly9\'');
            console.log(data);
        });

      };


    }])

  .controller('AdminAssignCtrl', ['$scope', '$ionicActionSheet', '$state', '$stateParams', '$firebase', 'firebaseSync', 'usersService', 'competencyQuestionsDataService', '$translate',
      function($scope, $ionicActionSheet, $state, $stateParams, $firebase, firebaseSync, usersService,  competencyQuestionsDataService, $translate) {
        $scope.user = firebaseSync.syncObject('users/' + $stateParams.userId);

        $scope.roles = [{title: 'admin', text: 'Administrator'},
          {title: 'user', text: 'User'}];

        $scope.data = {showReorder: false};
        $scope.save = function(){
          $ionicActionSheet.show({
                 titleText: '<h4>Wollen Sie die Änderungen wirklich speichern?</h4>',
                 destructiveText: "Ja, die alten Werte überschreiben",
                 cancelText: "Nein, nicht speichern",
                 cancel: function() {
                   console.log('Cancelled Override');
                 },
                 destructiveButtonClicked: function() {
                   $scope.user.$save();
                   $state.go("app.admin.users");
                   return true;
                 }
               });
        };
        firebaseSync.syncArray('competency/answeroptions').$loaded().then(function(rawOpt){
          $scope.rawansoptions = rawOpt;
        });

        competencyQuestionsDataService.getAnswerOptions().then(function(arr){
          $scope.answeroptions = arr;
        });



        $scope.moveItem = function(item, fromIndex, toIndex) {
           var _toIndexObj = $scope.rawansoptions.$getRecord($scope.rawansoptions.$keyAt(toIndex));
           var _fromIndexObj = $scope.rawansoptions.$getRecord($scope.rawansoptions.$keyAt(fromIndex));
           var _toIndexPriority = _toIndexObj.$priority;
           var _fromIndexPriority = _fromIndexObj.$priority;
           firebaseSync.syncObject("competency/answeroptions/" + _toIndexObj.$id).$loaded().then(function(retObj){
             retObj.$priority = _fromIndexPriority;
             retObj.$save();
           });
           firebaseSync.syncObject("competency/answeroptions/" + _fromIndexObj.$id).$loaded().then(function(retObj){
             retObj.$priority = _toIndexPriority;
             retObj.$save();
           });

           $scope.answeroptions.splice(fromIndex, 1);
           $scope.answeroptions.splice(toIndex, 0, item);
         };

      }])
;
