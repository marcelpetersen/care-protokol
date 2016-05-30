'use strict';

angular
	.module('ppApp.service.reward', [
	])
	.factory('rewardService', ['$firebase', 'firebaseSync', '$q', 'loginService', 'usersService',
    function($firebase, firebaseSync, $q, loginService, usersService) {

		var _rewardedItem = {};
		var _goToState = '';

		return {
					getRewardedItems: function() {
						var currentRewardsRef  = new Firebase(_rewardedItem.parent().toString());
						return $firebase(currentRewardsRef).$asArray();
			         },

          			 getRewardedItem: function(rewardedItem) {

			     	 	if(rewardedItem != undefined || rewardedItem != null) {
			        		_rewardedItem = rewardedItem;
						}
						var currentRewardRef  = new Firebase(_rewardedItem.toString());
						return $firebase(currentRewardRef).$asObject();
			         },

					 getGoToState: function(goToState) {

			     	 	if(goToState != undefined || goToState != null) {
			        		_goToState = goToState;
						}
						return _goToState;
					  },

					  getAllBadgesAndRewards: function() {

              var badgesDefer = $q.defer();
              var rewardedItemsDefer = $q.defer();

              var resDefer = $q.defer();
              resDefer.resolve([
                {
                  badgesPromise: badgesDefer.promise
                },
                {
                  rewardedItemsPromise: rewardedItemsDefer.promise
                }
              ]);

              usersService.getFamilyForCurrentUser().then(function(famObj){
                if(famObj != null) {
                  var familyKey = famObj.$value;
                  var familyItemsPath = 'families/' + familyKey + "/items";
                  var familyItemsRefPath = firebaseSync.syncArray(familyItemsPath);

                  loginService.getUser().then(function(currentLoggedInUser){
                      familyItemsRefPath.$loaded().then(function(items) {

                        var badgesArray = [];
                        var rewardeditems = [];

                        angular.forEach(items, function(val, key) {
                           badgesArray.push(val.$id);

                            if(val.user == currentLoggedInUser.uid) {
                              //console.log(val);
                              rewardeditems.push(val);
                            }

                        });

                        badgesDefer.resolve(badgesArray);
                        rewardedItemsDefer.resolve(rewardeditems);

                    });
                  });
                }
              }, function(error){
                          resDefer.reject('no user');
                        })
					    return resDefer.promise;
					  }
    		};

}]);