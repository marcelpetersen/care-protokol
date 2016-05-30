'use strict';

angular
	.module('ppApp.service.gamification', [
		'firebase'
	])
	.factory('gamificationService', ['$firebase', 'firebaseSync', '$q', '$timeout', 'gamificationConfig', 'sectionConfigService', 'familiesService', 'loginService', '_', function($firebase, firebaseSync, $q, $timeout, gamificationConfig, sectionConfigService, familiesService, loginService, _) {
		
		var familyRefPath = function(familyKey) {
			return 'families/' + familyKey;
		};

		var sectionRefPath = function(familyKey, section){
			return familyRefPath(familyKey) + '/' + section;
		};

		var sectionMileNextRefPath = function(familyKey, section){
			return sectionRefPath(familyKey, section) + '/milestones/next';
		};
		
		var sectionMileCompletedRefPath = function(familyKey, section) {
			return sectionRefPath(familyKey, section) + '/milestones/completed';
		};

		var gamificationItemsRefPath = function() {
			return 'gamification/items';
		}

		var familyItemsRefPath = function(familyKey) {
			return familyRefPath(familyKey) + '/items';
		};

		var moveMilestoneToCompleted = function(familyKey, section, milestoneName) {
			var milestoneNextRefPath = sectionMileNextRefPath(familyKey, section); // if reached milestone remove from here
			var milestoneCompleteRefPath = sectionMileCompletedRefPath(familyKey, section) + '/' + milestoneName; // if reached milestone add here
			var defer = $q.defer();
			 firebaseSync.syncArray(milestoneNextRefPath).$loaded().then(
				function(milestoneNextItems) {
				
					var milestoneNextItemTobeMoved = milestoneNextItems.$getRecord(milestoneName);

					console.log('Milestone item to be moved from /next to /completed...');
					console.log(milestoneNextItemTobeMoved);

					if(milestoneNextItemTobeMoved != null) { // if anything to be removed
						var tobeAddedNode = _.clone(milestoneNextItemTobeMoved);
						tobeAddedNode[".priority"] = milestoneNextItemTobeMoved.$priority;						
						if(tobeAddedNode.hasOwnProperty("$id")) {
							delete tobeAddedNode["$id"];
						}
						if(tobeAddedNode.hasOwnProperty("$priority")) {
							delete tobeAddedNode["$priority"];
						}
						console.log("Adding node to data/completed...");
						console.log(tobeAddedNode);
						defer.resolve('milestone item moved...from next/completed..');
						$firebase(firebaseSync.ref(milestoneCompleteRefPath + '/')).$set(tobeAddedNode).then(
							function(milestoneCompletedItems) {
								console.log("Copied milestone item to data/completed!!")
								 milestoneNextItems.$remove(milestoneNextItemTobeMoved).then(
									function(ref) {
										console.log("Removed milestone item from data/next!!")
										defer.resolve(milestoneNextItemTobeMoved);
									},
									function(err){
										console.log('Not able to remove milestone item from data/next!!...' + err);
										defer.reject(true);
									});

						},
						function(err){
							console.log('Not able to add milestone item to data/completed!!...' + err);
							defer.reject(true);
						});

					} else {
						console.log('Nothing to be moved as milestone next item: ' + milestoneName + ' not found!!');
						defer.reject(true);
					}
				},
			function(err) {
				console.log('Not able to fetch milestone data/next for removal!!..' + err)
				defer.reject(true);
			});
			
			return defer.promise;
		};

		var addMilestoneReward = function(familyKey) {
			var _gamificationItemsRefPath = gamificationItemsRefPath();

			// Find the heaviest item from /families/.../items
			var _familyItemsRefPath = familyItemsRefPath(familyKey);

			var defer = $q.defer();
			console.log(_familyItemsRefPath);

			var _familyItemsRef = firebaseSync.ref(_familyItemsRefPath).limit(1).endAt();
			$firebase(_familyItemsRef).$asArray().$loaded().then(
				function(_familyItemsData) {
					console.log('Family Items Data...:');
					console.log(_familyItemsData);
					
					var constraints = {limit: 1};

					if(_familyItemsData.length == 0) {
						// fetch lightest data, from /gamification/items
						constraints.startAt = null;
					} else {
						// fetch the next heaviest data
						constraints.startAt = _familyItemsData[0].$priority + 1;
					}

					// now fetching...
					firebaseSync.syncArray(_gamificationItemsRefPath, constraints).$loaded().then(
						function(_gamificationItemData) {


							loginService.getUser().then(
								function(currentLoggedInUser){
					      			if(currentLoggedInUser !== null) {

					      				console.log("Fetching rewards from gamification/items...");
										console.log(_gamificationItemData);

										if (_gamificationItemData.length == 1) {

											var familyRewardItemTobeAdded = _.clone(_gamificationItemData[0]);
											familyRewardItemTobeAdded[".priority"] = _gamificationItemData[0].$priority;
											
											// and in this node we store in the object the user as id, 
											// and the created as iso datetime
											familyRewardItemTobeAdded["user"] = currentLoggedInUser.uid;
											familyRewardItemTobeAdded["created"] =  new Date().toISOString();

											if(familyRewardItemTobeAdded.hasOwnProperty("$id")) {
												delete familyRewardItemTobeAdded["$id"];
											}
											if(familyRewardItemTobeAdded.hasOwnProperty("$priority")) {
												delete familyRewardItemTobeAdded["$priority"];
											}

											console.log("Adding rewards to families/../items...");
											console.log(familyRewardItemTobeAdded);

											$firebase(firebaseSync.ref(_familyItemsRefPath + '/' + _gamificationItemData[0].$id + '/')).
											$set(familyRewardItemTobeAdded).
											then(
												function(familyRewardItemAdded) {
													console.log("Copied reward item to families/../items!!");
													defer.resolve(familyRewardItemAdded);
												},
												function(err){
													console.log('Not able to add reward item to families/../items!!...' + err);
													defer.reject(true);
												});
										} else {
											console.log('No more rewards to be given out!');
											defer.reject(true);
										}
					      				
					      			} else {
					      				
					      				def.reject(true);
					      				 
					      			}
					      		},
					      		function(error){
					      			def.reject(true);
					      		});
						},
						function(err){
							console.log("Some thing went wrong when /gamifiction/items.. fetcher!!..." + err);
							defer.reject(true);
						});
					
				},
				function(err){
					console.log("Some thing went wrong when /families/.../items.. fetcher!!..." + err);
					defer.reject(true);
				});

			return defer.promise;

		};

		var filterGeneratedReq = function(coll) {
			return _.filter(coll, function(each){
				return each.state.current == familiesService.printOutRequestStates.prepared;
			})
		};

		var rulesObject = {
			printreqesttoprint: function(familyKey, section) {
				//$timeout(function() {
				var defer = $q.defer();
				
				// by now a singular entry in ../printout/requests/ should be 'generated', so
				// milestone is reached
				 familiesService.getAllPrintOutRequests(familyKey).$loaded().then(
					function(printoutReqData) {
						// console.log(printoutReqData);
						 // var generatedPrintoutReqData = filterGeneratedReq(printoutReqData);
						
						if(printoutReqData.length != 1) {
							console.log('Still not reached this milestone!!');
							 defer.reject(true);
						} else {
							// find the item/badge and return

							//  remove from next and move into completed

							// add the heaviest prioritised item not in /family/../items list copied
							// from /gamification/items with the additional info
							//  user as id, and the created as iso datetime

							console.log('Reached this milestone!!');
							moveMilestoneToCompleted(familyKey, section, 'printreqesttoprint').then(
								function(res){
									console.log('Successfully done the cut/paste op!!...');
									console.log(res);
									addMilestoneReward(familyKey).then(
										function(rewardRef){
											console.log('Reward item added to family tree!...');
											console.log(rewardRef);
											defer.resolve(rewardRef);

										},
										function(err){
											console.log('Some error in adding milestone reward op!!...' + err);
									 		defer.reject(true);
										});
								},
								function(err){
									console.log('Some error in doing the cut/paste op!!...' + err);
									 defer.reject(true);
								});
						}

					},
					function(err) {
						 defer.reject(true);
					});
				//}, 30000);

					return defer.promise;
			},

			printreqesttoprint5x: function(familyKey, section) {
				// not implemented as of now...
				var defer = $q.defer();
				defer.reject(true);
				return defer.promise;
			}
		};
	
		return {
			init: function() {
				//console.log(gamificationConfig);
				var _gamificationItemsRefPath = gamificationItemsRefPath();
				var defer = $q.defer();
				return firebaseSync.keyExists(_gamificationItemsRefPath).then(function(path) {
						if(path === null) {
							 $firebase(firebaseSync.ref(_gamificationItemsRefPath + '/')).$set(gamificationConfig[0]);
							 defer.resolve(true);
						} else {
							console.log('Path '+ path + ' exists');
							 defer.reject(false);
						}
						return defer.promise;

					}, function(err){
						console.log('Error while init gamification node: ' + err);
						 defer.reject(true);
						 return defer.promise;
					})
			},

			initMilestoneNext: function(familyKey, section) {
				var defer = $q.defer();
				var _sectionMileNextRefPath = sectionMileNextRefPath(familyKey, section);
				// Will change this later to keyexists..
				// Right now has just been used to init and fill data..
				return firebaseSync.syncArray(_sectionMileNextRefPath).$loaded().then(
					function(milestoneNextData) {
						if(milestoneNextData.length == 0) {
							// no milestone next data for this ../section/milestones/next
							var initMilestoneNext = sectionConfigService.getAppSectionMilestone(section);
							return $firebase(firebaseSync.ref(_sectionMileNextRefPath + '/')).$set(initMilestoneNext).then(
									function(ref) {
										// return as $firebase, use it like you want to
										return $firebase(ref);
									},
									function(err){
										return defer.reject("Error! Unable to set init value!!" + err);
									}
								);
						} else {
							var pathFound = "Milestone next node for section: " + section + " already exists!";
							// return as $firebase, use it like you want to
							return milestoneNextData.$inst();
						}
					},
					function(err){
						return defer.reject("Error while checking for section ["+ section +"], milestone 'next'!..." + err);
					});
			},

			checkMilestone: function(familyKey, section) {

				// Unrelated code to init milestone
				//var self = this;
				//self.initMilestoneNext(familyKey, section).then(function(c){console.log(c);}, function(x){console.log(x);});

				var defer = $q.defer();
				var _sectionMileNextRefPath = sectionMileNextRefPath(familyKey, section);

				return firebaseSync.syncArray(_sectionMileNextRefPath, {limit: 1, startAt: 0}).$loaded().then(
					function(nextMileStoneToResolve){
						var milestoneKey = nextMileStoneToResolve.$keyAt(0);
						if(rulesObject.hasOwnProperty(milestoneKey) &&
						 typeof rulesObject[milestoneKey]== "function") {
							return rulesObject[milestoneKey](familyKey, section);
						} else {
							// do nothing
							return defer.reject(false);
						}

					},
					function(err){
						console.log("Error fetching next milestone!!..@" + _sectionMileNextRefPath);
						return defer.reject(false);
					});
			}


		}



}]);