/**
 * Created by anisur on 04/09/14.
 */

ppAppCtrl.controller("PrintoutCtrl", ["$scope", "$rootScope", "firebaseSync", "$state", "$stateParams", "$ionicPopup", "$http", "sectionConfigService", "usersService", "familiesService", "gamificationService", "ppPrintoutAppURL", "_", 
    function($scope, $rootScope, firebaseSync, $state, $stateParams, $ionicPopup,  $http, sectionConfigService, usersService, familiesService, gamificationService, ppPrintoutAppURL, _) {

    	$scope.allDates = true;
    	$scope.allSections = true;
    	
    	$scope.request = {
    		dateRange: {
    			start: new Date().toISOString(),
    			end: new Date().toISOString()
    		}
       };

      $scope.request.sections = sectionConfigService.getAppSections('printout');
      
      $scope.tmp = {newDate: new Date().toISOString()};
      	
	    $scope.enableAllDates= function() {
	      $scope.allDates = true;
	    };

	    $scope.disableAllDates = function() {
	      $scope.allDates = false;
	    };

	    $scope.enableAllSections= function() {
	      $scope.allSections = true;
	    };

	    $scope.disableAllSections = function() {
	      $scope.allSections = false;
	    };	  

	    // Dispatch printout request to ppPrintoutApp
	  	$scope.dispatchPrintoutRequest = function(request) {
       
        try {

          console.log('Dispatch Printout Request: ');
           console.log(request);

          usersService.getFamilyForCurrentUser().then(function(familyData){

            var familyID = familyData.$value;
            //console.log(familyData);

            if(familyID !== null) {
              familiesService.createPrintOutRequest(familyID, request).then(function(fbRef) {

                var pushedRequestId = fbRef.name();

                if (localStorage) {
                  var firebaseSessionObj = JSON.parse(localStorage.getItem('firebaseSession'));
                  var data = {
                    signedRequest: {
                      auth_token: firebaseSessionObj.token,
                      user: firebaseSessionObj.user
                    },
                    fbPrintoutRequestId: pushedRequestId
                  }
                  $http.post(ppPrintoutAppURL + '/pdf', data).success(function(res) {
                    console.log('Request submitted! Server response... ');
                    console.log(res);
                    familiesService.updatePrintOutRequestState(
                      familyID,
                      pushedRequestId,
                      familiesService.printOutRequestStates.requested).then(
                        function(saved) {
                          console.log('Printout request state updated for: '+ pushedRequestId);
                          $state.go('app.printout.archive');
                        },
                        function(err){
                          console.log('Error updating request state for: '+ pushedRequestId);
                          console.log('Details:');
                          console.log(err);
                        }
                      );

                  });
                }
                
              },
              function(err){
                console.log('Error: '+ err);
              });
            }
          }, function(err){
              console.log(err);
              $state.go('app.login');
          });

        } catch(error) {
          console.log(error);
        }
	  	};  

	  	/**
	  	*	TODO: Will normalize openDateStart / openDateEnd
	  	*	into a singular openDate(..)
	  	*
	  	*/
	  	$scope.openDateStart = function() {
        var datePopup = $ionicPopup.show({
           template: '<datetimepicker ng-model="tmp.newDate" datetimepicker-config="{ startView:\'day\', minView:\'day\' }"></datetimepicker>',
           title: "Start Date",
           scope: $scope,
           buttons: [
             { text: 'Cancel' },
             {
               text: '<b>Save</b>',
               type: 'button-positive',
               onTap: function(e) {
                 $scope.request.dateRange.start = $scope.tmp.newDate;
               }
             }
           ]
         });
      };

      $scope.openDateEnd = function() {
        var datePopup = $ionicPopup.show({
           template: '<datetimepicker ng-model="tmp.newDate" datetimepicker-config="{ startView:\'day\', minView:\'day\' }"></datetimepicker>',
           title: "End Date",
           scope: $scope,
           buttons: [
             { text: 'Cancel' },
             {
               text: '<b>Save</b>',
               type: 'button-positive',
               onTap: function(e) {
                 $scope.request.dateRange.end = $scope.tmp.newDate;
               }
             }
           ]
         });
      };


}]);

ppAppCtrl.controller("PrintoutArchiveCtrl", ["$scope", "$rootScope", "firebaseSync", "$state", "$stateParams", "$ionicPopup", "$http", "sectionConfigService", "usersService", "familiesService", "ppPrintoutAppURL", "_", 
    function($scope, $rootScope, firebaseSync, $state, $stateParams, $ionicPopup,  $http, sectionConfigService, usersService, familiesService, ppPrintoutAppURL, _) {

      $scope.archiveitems = [];
      $scope.archiveitem = {};

      function getAllArchivedItems() {
       usersService.getFamilyForCurrentUser().then(
          function(familyData){

            var familyID = familyData.$value;
            //console.log(familyData);

            if(familyID !== null) {
              $scope.archiveitems = familiesService.getAllPrintOutRequests(familyID);
              if($stateParams.item !== undefined) {
                $scope.archiveitem = familiesService.getPrintOutRequest(familyID, $stateParams.item);
              }
            }
          },
          function(err){
            console.log('Not able to fetch family for a user: ');
            console.log(err);
          });

      }

      getAllArchivedItems();


}]);
