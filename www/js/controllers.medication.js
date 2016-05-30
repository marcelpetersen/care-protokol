/**
 * Created by anisur on 04/09/14.
 */
ppAppCtrl.controller("MedicationCtrl", ["$scope", "firebaseSync", "$state", "$ionicActionSheet",
    "$stateParams", 'loginService', 'usersService', "Family", "familiesService", "medicationDataService", "$timeout",
    function($scope, firebaseSync, $state, $ionicActionSheet,
             $stateParams, loginService, usersService, Family, familiesService, medicationDataService, $timeout) {
      var family;
      loginService.getUser().then(function(currentUser){
        if(currentUser !== null) {
          usersService.getFamily(currentUser).then(function(famObj){
            family = famObj.$value;
            $scope.drugs = firebaseSync.syncArray("families/" + family + "/medication/drugs");
          });
        }
      });


      $scope.notMedicationRequired = function(){
        firebaseSync.keyExists("families/" + family + "/medication/drugs").then(function(retObj){
          if(retObj === null) {
            familiesService.setSectionState('medication', family, 'completed');
            $state.go("app.home");
          } else {
            //we need to update as false;
            var drugsArr = firebaseSync.syncArray("families/" + family + "/medication/drugs");
            drugsArr.$loaded().then(function(drugs){
              angular.forEach(drugs, function(val){
                drugs.$remove(val);
              });
              $timeout(function() {
                 familiesService.setSectionState('medication', family, 'completed');
                 $state.go("app.home");
               });
            });
          }
        });
      };

      $scope.medicationComplete = function() {
        $timeout(function() {
          familiesService.setSectionState('medication', family, 'completed');
          $state.go("app.home");
        });
      };

      /* ui-sref="app.medication.detail({entryId: entry.$id})" */

      $scope.moveItem = function(item, fromIndex, toIndex) {
          $scope.drugs.splice(fromIndex, 1);
          $scope.drugs.splice(toIndex, 0, item);
      };

      $scope.data = {
        showDelete: false
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
                      firebaseSync.syncArray('families/' + family + '/medication/drugs').$loaded().then(function(ref){
                        ref.$remove(ref.$indexFor(obj.$id));
                      });
                      return true;
                    }
                  });
      };

    }])

  .controller("MedicationAddEditCtrl", ["$scope", "firebaseSync", "$state", "$stateParams", 'loginService', 'usersService',
     "Family", "familiesService", "medicationDataService", "$ionicActionSheet", "$ionicModal", "$timeout",
     function($scope, firebaseSync, $state, $stateParams, loginService, usersService, Family, familiesService,
              medicationDataService, $ionicActionSheet, $ionicModal, $timeout) {

       var family;

       $scope.entryMode = $stateParams.entryId ? "Change" : "Save";
       $scope.entryId = $stateParams.entryId;
       $scope.applications = medicationDataService.getApplications();
       $scope.incharges = medicationDataService.getInCharge();
       $scope.helps = medicationDataService.getHelps();

       loginService.getUser().then(function(currentUser){
         if(currentUser !== null) {
           usersService.getFamily(currentUser).then(function(famObj){
             family = famObj.$value;
             if ($scope.entryMode == "Save") {
               $scope.currentEntry = {dosage: 1,  morning: 0, midday: 0, evening: 0, night: 0, notes: ""};
             } else {
               $scope.currentEntry = medicationDataService.getEntry(family, $scope.entryId);
             }
           });
         }
       });




       $ionicModal.fromTemplateUrl('modal.medication.error.html', {
           // Use our scope for the scope of the modal to keep it simple
           scope: $scope,
           // The animation we want to use for the modal entrance
           animation: 'slide-in-up'
       }).then(function(modal){
         $scope.modal = modal;
       });

       $scope.reduceDosage = function() {
         if ($scope.currentEntry.dosage > 0)
           $scope.currentEntry.dosage -= 0.25 ;
       };

       $scope.increaseDosage = function() {
         if ($scope.currentEntry.dosage < 2)
           $scope.currentEntry.dosage += 0.25;
       };

       $scope.enableSave = function() {
         if($scope.entryMode == "Save") {
           if ($scope.currentEntry.title == '' || $scope.currentEntry.title == null) {
             return true;
           } else if($scope.currentEntry.morning == 0
             && $scope.currentEntry.midday == 0
             && $scope.currentEntry.evening == 0
             && $scope.currentEntry.night == 0) {
             return true;
           } else if($scope.currentEntry.help == '' || $scope.currentEntry.help == null) {
             return true;
           } else {
             return false;
           }
         } else {
           return false;
         }
       };

       $scope.reduceMornAmount = function() {
         if($scope.currentEntry.morning > 0) {
           $scope.currentEntry.morning--;
         }
       }

       $scope.increaseMornAmount = function() {
        if($scope.currentEntry.morning < 5) {
          $scope.currentEntry.morning++;
        }
      }

       $scope.reduceMidAmount = function() {
          if($scope.currentEntry.midday > 0) {
            $scope.currentEntry.midday--;
          }
        }

       $scope.increaseMidAmount = function() {
         if($scope.currentEntry.midday < 5) {
           $scope.currentEntry.midday++;
         }
       }

       $scope.reduceEveAmount = function() {
          if($scope.currentEntry.evening > 0) {
            $scope.currentEntry.evening--;
          }
        }

       $scope.increaseEveAmount = function() {
         if($scope.currentEntry.evening < 5) {
           $scope.currentEntry.evening++;
         }
       }

       $scope.reduceNightAmount = function() {
          if($scope.currentEntry.night > 0) {
            $scope.currentEntry.night--;
          }
        }

       $scope.increaseNightAmount = function() {
         if($scope.currentEntry.night < 5) {
           $scope.currentEntry.night++;
         }
       }

       $scope.showNext = function(flag) {
         var errorArr = [];
         $scope.formerrors = [];
         $scope.showError = false;
         var error = $scope.frmAddEditEntry.$error;
         angular.forEach(error, function(field){
           angular.forEach(field, function(val){
             if (val.$invalid == true) {
               if (errorArr.indexOf(val.$name) == -1)
                  errorArr.push(val.$name);
             }
           });
         });

         if(errorArr.length > 0) {
           $scope.formerrors = [];
           $scope.showError = true;
           var errorKeys = medicationDataService.getFormErrorKeys();
           angular.forEach(errorArr, function(err){
             $scope.formerrors.push(errorKeys[err]);
           });
         }

         if(flag == 1) {
           if(errorArr.length == 0) {
             if($scope.currentEntry.morning == 0 && $scope.currentEntry.midday == 0 && $scope.currentEntry.evening == 0 && $scope.currentEntry.night == 0 ) {
               errorArr.push('amount');
               $scope.formerrors.push(errorKeys['amount']);
               $scope.showError = true;
               $scope.modal.show();
             } else {
                $scope.formScreen = "screen2";
             }
           }
         } else {
           if (errorArr.length > 0) {
             $scope.modal.show();
           } else {
            $scope.formScreen = null;
           }
         }
       };

       $scope.save = function(entry) {
         var errorArr = [];
         $scope.formerrors = [];
         $scope.showError = false;
         var error = $scope.frmAddEditEntry.$error;

         angular.forEach(error, function(field){
            angular.forEach(field, function(val){
              if (val.$invalid == true) {
                if (errorArr.indexOf(val.$name) == -1)
                   errorArr.push(val.$name);
              }
            });
          });

         if ($scope.formScreen != "screen2") {
           if($scope.currentEntry.morning == 0 && $scope.currentEntry.midday == 0 && $scope.currentEntry.evening == 0 && $scope.currentEntry.night == 0 ) {
             errorArr.push('amount');
           }
         }

         if (errorArr.length > 0) {
           $scope.formerrors = [];
           $scope.showError = true;
           var errorKeys = medicationDataService.getFormErrorKeys();
           angular.forEach(errorArr, function(err){
             $scope.formerrors.push(errorKeys[err]);
           });
           $scope.modal.show();

         } else {
           if($scope.entryMode == "Change") {
               //Edit mode
               if($scope.formScreen == "screen2") {
                 $ionicActionSheet.show({
                    titleText: '<h4>Wollen Sie die Änderungen wirklich speichern?</h4>',
                    destructiveText: "Ja, die alten Werte überschreiben",
                    cancelText: "Nein, nicht speichern",
                    cancel: function() {
                      console.log('Cancelled overwrite');
                    },
                    destructiveButtonClicked: function() {
                      console.log('Medication overwritten');
                      $scope.currentEntry.$save();

                      $state.go("app.medication.entries");
                      return true;
                    }
                 });
               } else {
                    $scope.formScreen = "screen2";
                    $scope.showError = false;
                }
             } else {
                 if($scope.formScreen == "screen2") {
                   firebaseSync.syncArray("families/" + family + "/medication/drugs").$loaded().then(function(drugs){
                     drugs.$add(entry);
                     familiesService.setSectionState('medication', family, 'viewed');
                     $state.go("app.medication.entries");
                   });
                 } else {
                     $scope.formScreen = "screen2";
                     $scope.showError = false;
                 }
             }
          }
       }
       $scope.$on('$destroy', function() {
           $scope.modal.remove();
       });
     }])
;