
var app = angular.module('pp.app.printout', 
    ['ppApp.config', 
    'ppApp.services',
    'ppApp.filters',
    'ngCookies',
    'ui.router']);

app.controller('displayFBDataController', [
  '$scope',
  '$q',
  '$timeout',
  'FBURL',
  'firebaseSync',
  '$firebase',
  '$firebaseSimpleLogin', 
  '_',
  'familiesService', 
  'usersService', 
  function(
    $scope, 
    $q, 
    $timeout, 
    FBURL, 
    firebaseSync,
    $firebase,
    $firebaseSimpleLogin, 
    _, 
    familiesService, 
    usersService) {

    var auth = null;

    /**
    * Keeping the headless horseman in mind
    */
    function sleepyhollow(mixed) {
        if(console && console.log) {
              console.log(mixed);
          }
    }

    function getFamilyForCurrentUser() {
      return usersService.getFamilyForCurrentUser().then(
            function(familyData){
              var familyID = familyData.$value;
              return familyID;
            },function(err) {
              sleepyhollow('Error fetching family Id for current user!!');
            });
    }

    function getFamilyNode(propName) {
      return getFamilyForCurrentUser().then(function(familyId) {
        return familiesService.getFamilyNode(familyId).then(
          function(familNode) {
            var familyNodeKeys = Object.keys(familNode);
            if(propName !== undefined && propName.length > 0 && familNode.hasOwnProperty(propName)) {
              return familNode[propName];
            }else{
              return familNode;
            }
          },
          function(err){
            sleepyhollow('Error in fetching family node');
            sleepyhollow(err);
          });
        },
        function(err){
        sleepyhollow(err);
        });
    }

    function getFamilyPrintoutRequestNode(fbPrintoutRequestId) {
      return getFamilyForCurrentUser().then(function(familyId) {
        return familiesService.getPrintOutRequest(familyId, fbPrintoutRequestId);
        },
        function(err) {
        sleepyhollow(err);
        });
    }

    function getFamilyCareData() {
      return getFamilyForCurrentUser().then(function(familyId) {
        return familiesService.getFamilyCareData(familyId);
        },
        function(err) {
        sleepyhollow(err);
        });
    }

    function updateRequestStatePass(args) {
      sleepyhollow('Successfully updated request state for: '+ window._pdfIonicAppArgs.fbPrintoutRequestId);
      sleepyhollow('Details:');
      sleepyhollow(args);
    }

    function updateRequestStateFail(args) {
      sleepyhollow('Error updating request state for: '+ window._pdfIonicAppArgs.fbPrintoutRequestId);
      sleepyhollow('Details:');
      sleepyhollow(args);
    }

    /**
    * PDF population of scope vars:
    * - familyname
    * - requestId
    * - request
    * - caredata
    */
    function populatePDFScopeVars() {

      var one = $q.defer();
      var two = $q.defer();
      var three = $q.defer();
      var four = $q.defer();
      var five = $q.defer();

      var stage_1 = $q.all([one.promise, two.promise]);
      var all = $q.all([one.promise, two.promise, three.promise, four.promise /*, five.promise*/]);

      $scope.requestId = window._pdfIonicAppArgs.fbPrintoutRequestId;
      $scope.categories = ['body', 'mobility', 'nutrition', 'household'];
      $scope.dateWiseLoadedData = [];

      getFamilyNode('familyname').then(function(familyname){
          $scope.familyname = familyname;
          one.resolve(familyname);
      });
      
      getFamilyPrintoutRequestNode(window._pdfIonicAppArgs.fbPrintoutRequestId).then(function(prNode){
          $scope.request = prNode;
          two.resolve(prNode);
      });

      getFamilyNode().then(function(familNode) {
           $scope.currentstate = function(key) {
              return familNode[key].state.current;
            };
          three.resolve(true);
      });

      getFamilyCareData().then(function(famCareData) {
        //$scope.caredata = famCareData;
        four.resolve(true);
      });

    getFamilyNode('$id').then(function(familyKey) {

          var careActDateRef = 'families/' + familyKey + '/care/activities/date/';
          firebaseSync.syncArray(careActDateRef).$loaded().then(

            function(objArr) {

              var prefixForCareNodes = FBURL + '/' + careActDateRef;

             
              var allActivityDates = [];
              var allCategoryDates = [];
              $scope.caredGroupByCatdata = {};

              objArr.forEach(
                function(curVal, idx) {

                  var careActDateNodeRefPrefix = prefixForCareNodes + curVal.$id + '/';

                  var catActComboPromises = {
                    'body': [],
                    'mobility': [],
                    'nutrition': [],
                    'household': []
                  };

                  var _mapped = $q.defer();
                  allActivityDates.push(_mapped.promise);

                  var mapped = {};
                  mapped[curVal.$id] = {};
                  mapped[curVal.$id]['body'] = undefined;
                  mapped[curVal.$id]['mobility'] = undefined;
                  mapped[curVal.$id]['nutrition'] = undefined;
                  mapped[curVal.$id]['household'] = undefined;
                  
                  firebaseSync.syncArray('care/activities').$loaded().then(

                    function(appCareData){
                     
                      appCareData.forEach(
                        function(elVal, elIdx) {

                          var catActDef = $q.defer();
                          catActComboPromises[elVal.category].push(catActDef.promise);

                           var _catActRef = new Firebase(careActDateNodeRefPrefix).
                                                      orderBy("categoryId").
                                                      startAt(elVal.category).
                                                      endAt(elVal.category).
                                                      orderBy("activityId").
                                                      startAt(elVal.$id).
                                                      endAt(elVal.$id)
                                                      ;

                            $firebase(_catActRef).$asArray().$loaded().then(
                              function(_catActData) {
                                 var catActGroup = {};
                                 catActGroup['activityKey'] = elVal.$id;
                                 catActGroup['activityDetails'] = _catActData;
                                 catActDef.resolve(catActGroup);
                            });
                      });
            
                     
                      var bodyPromise = $q.defer();
                      var mobilityPromise = $q.defer();
                      var nutritionPromise = $q.defer();
                      var householdPromise = $q.defer();

                      var catPromises = $q.all([
                                            bodyPromise.promise, 
                                            mobilityPromise.promise,
                                            nutritionPromise.promise,
                                            householdPromise.promise
                                            ]);

                      $q.all(catActComboPromises['body']).then(
                            function(groupedByBodydata) {
                              mapped[curVal.$id]['body'] = groupedByBodydata;
                              bodyPromise.resolve(true);
                          });

                      $q.all(catActComboPromises['mobility']).then(
                            function(groupedByMobilitydata) {
                              mapped[curVal.$id]['mobility'] = groupedByMobilitydata;
                              mobilityPromise.resolve(true);
                          });

                      $q.all(catActComboPromises['nutrition']).then(
                            function(groupedByNutritiondata) {
                              mapped[curVal.$id]['nutrition'] = groupedByNutritiondata;
                              nutritionPromise.resolve(true);
                          });

                      $q.all(catActComboPromises['household']).then(
                            function(groupedByHouseholddata) {
                              mapped[curVal.$id]['household'] = groupedByHouseholddata;
                              householdPromise.resolve(true);
                          });

                      catPromises.then(
                          function(allPromises) {
                            _mapped.resolve(mapped);
                       });

                  });

                  // Summary of a day...
                  var groupByCatPromises = {
                    'body': [],
                    'mobility': [],
                    'nutrition': [],
                    'household': []
                  };

                  var mapped2 = {};
                  mapped2[curVal.$id] = {};
                  mapped2[curVal.$id]['body'] = undefined;
                  mapped2[curVal.$id]['mobility'] = undefined;
                  mapped2[curVal.$id]['nutrition'] = undefined;
                  mapped2[curVal.$id]['household'] = undefined;

                 // $scope.caredGroupByCatdata = {};
                  $scope.caredGroupByCatdata[curVal.$id] = {};
                  $scope.caredGroupByCatdata[curVal.$id]['body'] = undefined;
                  $scope.caredGroupByCatdata[curVal.$id]['mobility'] = undefined;
                  $scope.caredGroupByCatdata[curVal.$id]['nutrition'] = undefined;
                  $scope.caredGroupByCatdata[curVal.$id]['household'] = undefined;


                  var _mapped2 = $q.defer();
                  allCategoryDates.push(_mapped2.promise);

                   firebaseSync.syncArray('care/categories').$loaded().then(
                        function(appCategories) { 
                          
                          appCategories.forEach(
                            function(elVal, elIdx) {

                              var catDef = $q.defer();
                              groupByCatPromises[elVal.$id].push(catDef.promise);

                               var _careCatRef = new Firebase(careActDateNodeRefPrefix).
                                                          orderBy("categoryId").
                                                          startAt(elVal.$id).
                                                          endAt(elVal.$id);

                                $firebase(_careCatRef).$asArray().$loaded().then(
                                  function(groupByCareData) {
                                     var catGroup = {};
                                     catGroup['catKey'] = elVal.$id;
                                     catGroup['groupByCatData'] = groupByCareData;
                                     catDef.resolve(catGroup);
                                });
                                
                       });

                      var bodyPromise2 = $q.defer();
                      var mobilityPromise2 = $q.defer();
                      var nutritionPromise2 = $q.defer();
                      var householdPromise2 = $q.defer();

                      var catPromises2 = $q.all([
                                            bodyPromise2.promise, 
                                            mobilityPromise2.promise,
                                            nutritionPromise2.promise,
                                            householdPromise2.promise
                                            ]);

                      $q.all(groupByCatPromises['body']).then(
                            function(groupedByBodydata) {
                              mapped2[curVal.$id]['body'] = groupedByBodydata;
                              $scope.caredGroupByCatdata[curVal.$id]['body'] = groupedByBodydata;
                              bodyPromise2.resolve(true);
                          });

                      $q.all(groupByCatPromises['mobility']).then(
                            function(groupedByMobilitydata) {
                              mapped2[curVal.$id]['mobility'] = groupedByMobilitydata;
                              $scope.caredGroupByCatdata[curVal.$id]['mobility'] = groupedByMobilitydata;
                              mobilityPromise2.resolve(true);
                          });

                      $q.all(groupByCatPromises['nutrition']).then(
                            function(groupedByNutritiondata) {
                              mapped2[curVal.$id]['nutrition'] = groupedByNutritiondata;
                              $scope.caredGroupByCatdata[curVal.$id]['nutrition'] = groupedByNutritiondata;
                              nutritionPromise2.resolve(true);
                          });

                      $q.all(groupByCatPromises['household']).then(
                            function(groupedByHouseholddata) {
                              mapped2[curVal.$id]['household'] = groupedByHouseholddata;
                             $scope.caredGroupByCatdata[curVal.$id]['household'] = groupedByHouseholddata;
                              householdPromise2.resolve(true);
                          });

                        catPromises2.then(
                          function(allPromises) {
                            _mapped2.resolve(mapped2);
                       });


                        }); 
                  

                });
           
                $q.all(allActivityDates).then(
                  function(allMapped) {
                    //console.log(' @@ ## allMapped ** ');
                    //console.log(allMapped);
                    $scope.caredata = allMapped;
                });

                $q.all(allCategoryDates).then(
                  function(allMappedByCat) {
                    //console.log('!! 2 allMappedByCat!! ');
                    //console.log(allMappedByCat);

                    //$scope.caredGroupByCatdata = allMappedByCat;

                });

            });
      });

      return all;
    }


    function authcallback(error, user) {
        if (user) {
          if(window._pdfIonicAppArgs.fbPrintoutRequestId !== undefined) {
              getFamilyForCurrentUser().then(
                function(familyId) {
                  sleepyhollow('Set FB print out status to \'recieved\' for family ' + familyId);
                 
                  familiesService.updatePrintOutRequestState(
                    familyId, 
                    window._pdfIonicAppArgs.fbPrintoutRequestId,
                    familiesService.printOutRequestStates.recieved).then(
                      function(saved){
                          updateRequestStatePass(saved);
                          
                          populatePDFScopeVars().then(function(allSteps){
                          
                          sleepyhollow('Set FB print out status to \'prepared\'');

                          familiesService.updatePrintOutRequestState(
                          familyId, 
                          window._pdfIonicAppArgs.fbPrintoutRequestId,
                          familiesService.printOutRequestStates.prepared).then(
                            updateRequestStatePass, 
                            updateRequestStateFail
                          );

                        },
                        function(err){
                          sleepyhollow('Error in fetching FB data!!');
                          sleepyhollow(err);
                        }
                        );

                      },
                      function(err){
                        updateRequestStateFail(err);
                      }
                    )
                },
                function(err) {
                sleepyhollow(err);
              });
          }

        } else if(error) {
          sleepyhollow('Error to init Auth data!!');
          sleepyhollow(error);
        }
    }
   

   function initFBVars() {
      auth = new FirebaseSimpleLogin(firebaseSync.ref(), authcallback);
      // Really writes into local storage
      var AUTH_TOKEN = window._pdfIonicAppArgs.signedRequest.auth_token;
      var user = window._pdfIonicAppArgs.signedRequest.user;

      auth.shareAuthSession(AUTH_TOKEN, user).then(function(authPayload) {
        sleepyhollow('Wrote auth data to local-storage');
        sleepyhollow(authPayload);
      },
      function(err){
        sleepyhollow('Error in attempting to write Auth data');
        sleepyhollow(err);
      });
   }

   function destroySession() {
      if(auth != null){
          //auth.logout();
      }
   }

   function processTerminator() {
       getFamilyForCurrentUser().then(
          function(familyId) {
          sleepyhollow('Set FB print out status to \'generated\'');
          sleepyhollow('Set generated PDF file name: '+ window._pdfIonicAppArgs.pdfFileName);
          familiesService.updatePrintOutRequestState(
                familyId, 
                window._pdfIonicAppArgs.fbPrintoutRequestId,
                familiesService.printOutRequestStates.generated,
                window._pdfIonicAppArgs.pdfFileName).then(
                  function(save){
                    updateRequestStatePass(save);
                    destroySession();

                  },
                  function(err){
                    updateRequestStateFail(err);
                    destroySession();
                  }
                  
                );
        },function(err){
          sleepyhollow(err);
        });
   }

    if(window._pdfIonicAppArgs && window._pdfIonicAppArgs !== undefined) {
      // Enabling running this statically..
      sleepyhollow('Found necessary args..');
      initFBVars();
      // Phantom Js trick, to trigger this app finisher..
      window.addEventListener("click", processTerminator);
    }
    
}]);

app.run(['loginService', '$rootScope', 'FBURL', function(loginService, $rootScope, FBURL) {
    
      if( FBURL === 'https://INSTANCE.firebaseio.com' ) {
        // double-check that the app has been configured
        angular.element(document.body).html('<h1>Please configure app/js/config.js before running!</h1>');
        setTimeout(function() {
          angular.element(document.body).removeClass('hide');
        }, 250);
      }
      else {
        // establish authentication
       // $rootScope.auth = loginService.init('/login');
       // $rootScope.FBURL = FBURL;

       // Nothing here right now!!


      }
}]);