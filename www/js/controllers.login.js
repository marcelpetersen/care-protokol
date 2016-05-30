/**
 * Created by anisur on 04/09/14.
 */

ppAppCtrl.controller('LoginCtrl', ['$scope', '$state','loginService', 'usersService', 'familiesService', 'firebaseSync', '$firebase', '$location', '$ionicLoading', '_', function($scope, $state, loginService, usersService, familiesService, firebaseSync, $firebase, $location, $ionicLoading, _) {
    $scope.user = {};
    $scope.user.email = null;
    $scope.user.password = null;
    $scope.user.confirm = null;
    $scope.createMode = false;

    $scope.enableCreateMode = function() {
      $scope.createMode = true;
    };

    $scope.disableCreateMode = function() {
      $scope.createMode = false;
    };

    $scope.login = function() {
        $scope.errMessage = null;

        if( assertValidLoginAttempt() ) {
            $ionicLoading.show({
              template: '<p>Augenblick, Sie werden angemeldet ... </p>'
            });

            loginService.login($scope.user.email, $scope.user.password, function(err, loggedInUser) {
              $ionicLoading.hide();
              $scope.errMessage = errMessage(err);
              console.log($scope.errMessage);
              if( !err ) {
                usersService.appUserExists(loggedInUser.uid).then(function(existingUser) {
                      // if not participating yet, then add the App user
                    if  ( !existingUser ) {
                      initUserProfile(loggedInUser);
                    }
                });
                //check whether current family set
                usersService.getFamily(loggedInUser).then(function(curFam){
                  if(curFam.$value === null) {
                    //no current family set, get the list of families
                    usersService.userFamilyExists(loggedInUser.uid).then(function(existingFam) {
                      if(!existingFam) {
                        //no family set for this user
                        //TODO The family should be available in FB data, else select the family
                        /*familiesService.getFamilyNode('knapp').then(function(famObj){
                          usersService.setFamily(loggedInUser, famObj);
                        });*/
                      } else {
                        //get the first family
                        usersService.getAllFamilies(loggedInUser).then(function(famArr){
                          var _firstFam = famArr.$getRecord(famArr.$keyAt(0));
                          usersService.setFamily(loggedInUser, _firstFam);
                        });
                      }
                    });
                  }
                });
              $state.go('app.home');
          };
        });
      }
    };

    $scope.createAccount = function() {
      $scope.err = null;
      if( assertValidLoginAttempt() ) {
        loginService.createAccount($scope.user.email, $scope.user.password)
         .then(function(loggedInUser) {
              // store user data in Firebase after creating account
              initUserProfile(loggedInUser);
              $state.go('app.account');
            }, function(err) {
              $scope.err = errMessage(err);
          });
      }
    };

    function initUserProfile(loggedInUser) {
      usersService.createProfileOfSLoginUser(loggedInUser).then(function() {
        usersService.addFamilyNode(loggedInUser.uid).then(function(family) {
              familiesService.createNewFamily(family.name(), loggedInUser.uid, usersService.getNameOfUser(loggedInUser)).then(function(family){
                console.log('Family init --');
                usersService.setFamily(loggedInUser, family);
              });
            });
          }, function(err) {
              console.log(err);
          });
    }

    function assertValidLoginAttempt() {
      if( !$scope.user.email ) {
        $scope.errMessage = 'Bitte geben Sie eine Email-Adresse an.';
      }
      else if( !$scope.user.password ) {
        $scope.errMessage = 'Bitte geben Sie ein Passwort an.';
      }
      else if($scope.createMode && $scope.user.password !== $scope.user.confirm ) {
        $scope.errMessage = 'Die Passwörter stimmen nicht überein.';
      }
      return !$scope.errMessage;
    }

    function errMessage(err) {
      console.log(err);
      if (angular.isObject(err) && err.code) {
        switch (err.code) {
          case 'INVALID_EMAIL':
            return 'Es wurde kein Nutzer mit dieser Email-Adresse gefunden';
          case 'INVALID_PASSWORD':
            return 'Das Passwort für diesen Nutzer ist falsch.'
        }
      }
      return false;
    }

  }])
;