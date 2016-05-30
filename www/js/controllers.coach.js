/**
 * Created by anisur on 04/09/14.
 */

ppAppCtrl.controller('CoachCoachingCtrl', ['$scope', '$stateParams', 'firebaseSync', function($scope, $stateParams, firebaseSync) {

    //console.log('enter CoachCoachingCtrl');

  }])

  .controller('CoachModuleCtrl', ['$scope', '$stateParams', 'firebaseSync', function($scope, $stateParams, firebaseSync) {

    //console.log('enter CoachModuleCtrl');

    $scope.playVideo = function() {
      var video = document.getElementById('vid');
      // console.log(video);
      video.play()
    }
  }])

  .controller('CoachQuestionnaireCtrl', function($scope) {

    $scope.clientSideList = [
      { text: "Das kommt sehr häufig vor", value: '2' },
      { text: "Das ist nur selten der Fall", value: '1' },
      { text: "Das passiert nie", value: '0' }
    ];
  })
;

