ppAppCtrl.controller("RewardCtrl", ["$scope", "$q", "firebaseSync", "rewardService",
  function($scope, $q, firebaseSync, rewardService) {

/*
     $scope.rewardeditems = rewardService.getRewardedItems();
		 $scope.rewardeditem = rewardService.getRewardedItem();
     $scope.gotostate = rewardService.getGoToState();
*/

    $scope.rewardeditems = [];
    $scope.badges;
    
    // http://stackoverflow.com/questions/17159614/how-do-i-pass-promises-as-directive-attributes-in-angular
    rewardService.getAllBadgesAndRewards().then(
      function(resArray) {
        $scope.badges = resArray[0];
        resArray[1].rewardedItemsPromise.then(
          function(rewardedItems) {
            $scope.rewardeditems = rewardedItems;
          }, 
          function(err) {
            console.log(err);
          });
      },
      function(err) {
        console.log(err);
      });
    
    //$scope.badges = ['shade', 'tree', 'way', 'window'];
    //$scope.badges = ["background", "houseplain", "window_1", "window_2", "rooflight", "shingle", "firstfloor"];
    // $scope.badges = [
    //  "background", "houseplain", "window_1", "window_2", "rooflight", "shingle", "firstfloor", "door",
    //      "shade", "tree", "way", "window", "windowdecoration", "way", "flowerathouse", "hedge", "bike", "wayflower", "terrace", "firstfloor", "flowerbox", "wateringcan", "shingle", "mailbox", "windmill", "stucco", "shinglecoloured", "bank", "pillow", "tree", "grill", "butterfly"]
    // "shade", "tree", "way", "window", "windowdecoration", "way", "hedge", "bike", "wayflower", "terrace", "tree"]
    //console.log($scope.badges);

    $scope.rewardeditem = firebaseSync.syncObject('families/knapp/items/flower');
    //$scope.gotostate = 'app.home';

}]);
