/**
 * Created by anisur on 04/09/14.
 */
ppAppCtrl.controller('CompetencyCtrl', ['$scope', 'firebaseSync', 'Family', '$state',
  		'familiesService', 'competencyQuestionsDataService', '$ionicActionSheet', 'loginService', 'usersService',
    function($scope, firebaseSync, Family, $state, familiesService, competencyQuestionsDataService,
             $ionicActionSheet, loginService, usersService) {

      var family;
      var user;

      loginService.getUser().then(function(currentUser){
        if(currentUser !== null) {
          user = currentUser.uid;
          usersService.getFamily(currentUser).then(function(famObj){
            family = famObj.$value;
          });
        }
      });


  		$scope.notAffected = function() {
  			/* For all the 13 questions, the answer options is not\
  			* dakna and knapp should be able in scope
  			* */
        // check whether this user has answered a question


        firebaseSync.keyExists('families/' + family + '/competency/answers').then(function(chkObj){
          if (chkObj === null) {
            competencyQuestionsDataService.saveAllNever(user,family).then(function(nouse){
              familiesService.setSectionState('competency', family, 'completed');
              $state.go("app.home");
            });
          } else {
             $ionicActionSheet.show({
              titleText: '<h4>Wollen Sie die Änderungen wirklich speichern?</h4>',
              destructiveText: "Ja, die alten Werte überschreiben",
              cancelText: "Nein, nicht speichern",
              cancel: function() {
                console.log('Cancelled overwrite');
              },
              destructiveButtonClicked: function() {
                console.log('Competency answers overwritten');
                competencyQuestionsDataService.saveAllNever(user,family).then(function(nouse){
                  familiesService.setSectionState('competency', family, 'completed');
                });
                $state.go("app.home");
                return true;
              }
            });
          }
        });
      }; //end function

    }])

    .controller('CompetencyQuestionsCtrl', ['$scope', '$state',
  		'$stateParams', 'Family', 'firebaseSync', 'familiesService', 'loginService', 'usersService',
  		'competencyQuestionsDataService', '$ionicActionSheet', '$ionicPopover',
  		'$ionicPopup', '$timeout', '$translate', 'COMPETENCY_QUESTION_COUNT', function($scope, $state, $stateParams,
  														  Family, firebaseSync, familiesService, loginService, usersService,
  														  competencyQuestionsDataService, $ionicActionSheet, $ionicPopover,
  														  $ionicPopup, $timeout, $translate, COMPETENCY_QUESTION_COUNT) {

      var family;
      var _user;

     competencyQuestionsDataService.getAnswerOptions().then(function(arr){
       $scope.answeroptions =  arr;
     });
     $scope.questions = competencyQuestionsDataService.getQuestions();

      loginService.getUser().then(function(currentUser){
        if(currentUser !== null) {
          _user = currentUser.uid;
          usersService.getFamily(currentUser).then(function(famObj){
            family = famObj.$value;

            competencyQuestionsDataService.getAnsweredQuestion(family).then(function(retObj) {
              	$scope.completedQuestions = retObj;
             });

              familiesService.getSectionState('competency', family).then(function(stateObj) {
                if(stateObj.$value !== 'completed') {
                  competencyQuestionsDataService.getCurrentOpenQuestion(family).then(function(obj) {
                    $scope.currentOpenQuestion =  obj;
                  });
                };
              });
          });
        }
      });





  		$scope.newAnswer = {option:'never'};
  		$scope.answeroption = {};

  		$ionicPopover.fromTemplateUrl('popover.competency.question.html', {scope: $scope}).then(function(popover) {
  		    $scope.popover = popover;
          $scope.popover.text = {};
  		});
      $scope.getQuestionIndex = function() {
        if($scope.completedQuestions) {
          return $scope.completedQuestions.length;
        } else {
          return 0;
        }
      };


  		$scope.openPopover = function($event, content) {
        $scope.popover.content = content;
  			$scope.popover.show($event);
  	  };
  	  	$scope.closePopover = function() {
  			$scope.popover.hide();
  	  };
  	  	//Cleanup the popover when we're done with it!
  	  	$scope.$on('$destroy', function() {
  		  $scope.popover.remove();
  	  });



  		$scope.toggleAnswers = function(ans) {
  		if ($scope.isAnsShown(ans)) {
  		  $scope.shownAns = null;
  		} else {
  		  $scope.shownAns = ans;
  		}
  	  };

  	  $scope.isAnsShown = function(ans) {
  		return $scope.shownAns === ans;
  	  };


      $scope.updateAll = function(){
        $ionicActionSheet.show({
                    titleText: '<h4>Wollen Sie die Änderungen wirklich speichern?</h4>',
                    destructiveText: "Ja, die alten Werte überschreiben",
                    cancelText: "Nein, nicht speichern",
                    cancel: function() {
                      console.log('Cancelled overwrite');
                    },
                    destructiveButtonClicked: function() {
                      console.log('Competency answers overwritten');
                      angular.forEach($scope.completedQuestions, function(value){

                        firebaseSync.syncObject('families/' + family + '/competency/answers/' + value.answeroption.$id).$loaded().then(function(obj){
                          obj.note = value.answeroption.note || '';
                          obj.option = value.answeroption.option;
                          obj.changed = new Date().toISOString();
                          obj.$save();
                        });
                      });
                      $ionicPopup.alert({
                        title: 'Fragebogen zur Alltagskompetenz',
                        template: 'Ihre Antwort wurde gespeichert.'
                      });
                      $scope.toggleAnswers();
                      return true;
                    }
                  });
      };

  	  $scope.saveOption = function(ques){
  		  $scope.newAnswer.changed = new Date().toISOString();
  		  $scope.newAnswer.user = _user;

  		  var ansoption = firebaseSync.syncData('families/' + family + '/competency/answers');

  		  ansoption.$set(ques.$id, $scope.newAnswer).then(function() {
          if ($scope.completedQuestions && $scope.completedQuestions.length == COMPETENCY_QUESTION_COUNT) {
            //all answers provided
            familiesService.setSectionState('competency', family, 'completed');
            $state.go("app.home");
          } else {
            familiesService.setSectionState('competency', family, 'viewed');
            competencyQuestionsDataService.getAnsweredQuestion(family).then(function(retObj) {
              $scope.completedQuestions = retObj;
            });
            familiesService.getSectionState('competency', family).then(function(stateObj) {
              if(stateObj.$value !== 'completed') {
                competencyQuestionsDataService.getCurrentOpenQuestion(family).then(function(obj){
                  $scope.currentOpenQuestion =  obj;
                });
              };
            });
          }
          $scope.newAnswer = {option: 'never'};
          $ionicPopup.alert({
            title: 'Fragebogen zur Alltagskompetenz',
            template: 'Ihre Antwort wurde gespeichert.'
          });
  		  });
  	};

    }])
  ;