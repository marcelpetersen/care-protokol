/**
 * Created by anisur on 04/09/14.
 */

ppAppCtrl.controller('AccountCtrl', ['$scope', '$rootScope', 'loginService', 'firebaseSync', '$state', '$stateParams', '$ionicLoading', '$ionicActionSheet', 'usersService', function($scope, $rootScope, loginService, firebaseSync, $state, $stateParams, $ionicLoading, $ionicActionSheet, usersService) {
    //firebaseSync([$scope.auth.user]).$bind($scope, 'user');

    $scope.user = $rootScope.auth.user;
    $scope.currentFamily = {};
    $scope.allowSave = false;
    var _loggedInUser;

    $scope.logout = function() {
      loginService.logout();
      $state.go('app.home', $stateParams, {reload: true});
    };

    $scope.oldpass = null;
    $scope.newpass = null;
    $scope.confirm = null;

    $scope.reset = function() {
      $scope.err = null;
      $scope.msg = null;
    };

    $scope.updatePassword = function() {
      $ionicLoading.show({
        template: '<p>Augenblick, Ihr Passwort wird geändert... </p>'
      });
      $scope.reset();
      loginService.changePassword(buildPwdParms());
    };

    function buildPwdParms() {
      return {
        email: $scope.user.email,
        oldpass: $scope.user.oldpass,
        newpass: $scope.user.newpass,
        confirm: $scope.user.confirm,
        callback: function(err) {
          $ionicLoading.hide();
          if( err ) {
            $scope.err = err;
          }
          else {
            $scope.user.oldpass = null;
            $scope.user.newpass = null;
            $scope.user.confirm = null;
            $scope.msg = 'Ihr Passwort wurde geändert.';
          }
        }
      }
    }

  usersService.getFamilyForCurrentUser().then(function(famObj){
    $scope.currentFamily.key =  famObj.$value;
  });

  loginService.getUser().then(function(loggedInUser){
    _loggedInUser = loggedInUser;
    usersService.getAllFamilies(loggedInUser).then(function(famArr){
      $scope.families = famArr;
    });
  });

  $scope.enableSave = function(state) {
    $scope.allowSave = state;
  };

  $scope.updateFamily = function(cFam){
    $ionicActionSheet.show({
        titleText: '<h4>Wollen Sie die Änderungen wirklich speichern?</h4>',
        destructiveText: "Ja, die alten Werte überschreiben",
        cancelText: "Nein, nicht speichern",
        cancel: function() {
          console.log('Cancelled Override');
        },
        destructiveButtonClicked: function() {
          firebaseSync.syncObject('families/' + cFam.key).$loaded().then(function(famObj){
            usersService.setFamily(_loggedInUser, famObj);
          });
          return true;
        }
      });
  };

  }])

;