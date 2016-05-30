'use strict';

angular
	.module('ppApp.service.families', [
		'firebase'
	])

	.factory('familiesService', ['$firebase', '$rootScope', '$q', '$timeout', 'firebaseSync', '_', 'careCategoriesDataService', 'careActivitiesDataService', 'competencyQuestionsDataService', 'CARE_COMPLETE_COUNT',
		function($firebase, $rootScope, $q, $timeout, firebaseSync, _, careCategoriesDataService, careActivitiesDataService, competencyQuestionsDataService, CARE_COMPLETE_COUNT) {

		var careLevel1Func = function(familyKey, catsToCheckArr, minutesToCalc, numOfCatsToCheck) {
			
			 return this.checkCareLevelBasis(
			          minutesToCalc,
			          numOfCatsToCheck,
			          familyKey,
			          null,
			          null,
			          catsToCheckArr
		          );
			};

		return {

			createNewFamily: function(familyName, initUserUID, initUserName) {
				familyName = new String(familyName);
				if(familyName.length > 0) {

					var familyRefPath = 'families/' + familyName;

					return firebaseSync.keyExists(familyRefPath).then(function(path) {

						if(path === null) {

							var familyInitState = {
                  care: {
                    state: {
                      //Firebase.ServerValue.TIMESTAMP
                      changed: new Date().toISOString(),
                      current: 'initialized',
                      last: false
                    }
                  },
                  competency: {
                    state: {
                      //Firebase.ServerValue.TIMESTAMP
                      changed: new Date().toISOString(),
                      current: 'initialized',
                      last: false
                    }
                  },
                  medication: {
                    state: {
                      changed: new Date().toISOString(),
                      current: 'initialized',
                      last: false
                    }
                  },
                  tip: {
                      state: {
                        changed: new Date().toISOString(),
                        current: 'initialized',
                        last: false
                      }
                    },
                    printout : {
                      state : {
                        changed : new Date().toISOString(),
                        current : 'initialised',
                        last : false
                      }
                   },
								familyname: 'Familie ' + familyName,
								users: {

								}
							};

							familyInitState['users'][initUserUID] = {name: initUserName};
							return $firebase(firebaseSync.ref(familyRefPath + '/')).$set(familyInitState);

						} else {
							console.log('Path '+ path + ' exists');
						}

					}, function(err){
						console.log('Error while creating new family');
						console.log(err);
					});

				}
			},

	      setUser: function(familyKey, userObj){

	        firebaseSync.syncData('families/' + familyKey + '/users').$set(userObj.$id, {name: userObj.name});
	      },

			getFamilyNode: function(familyKey) {
				var familyRefPath = 'families/' + familyKey;
				return firebaseSync.syncObject(familyRefPath).$loaded();
			},

			getFamilyCareData: function(familyKey) {
				var familyCareDataPath = 'families/' + familyKey + "/care";
				return firebaseSync.syncObject(familyCareDataPath).$loaded();
				//return $firebase(firebaseSync.ref(familyCareDataPath));
			},

			getSectionState: function(section, familyKey) {
		        var def = $q.defer();
           		 var _fser = this;
		        $rootScope.auth.$getCurrentUser().then(function(usr){
		           if(usr) {
                 //for care, if activities has 7 days or more with one activity, then set to complete
                 if (section == 'care') {
                   firebaseSync.syncObject('families/' + familyKey + '/' + section + '/state/current').$loaded().then(function(obj){
                     if(obj.$value !== 'completed') {
                       var _dayCount = 0;
                        firebaseSync.syncArray('families/' + familyKey + '/care/activities/date').$loaded().then(function(dateArr) {
                          if(dateArr.length > 0) {
                           angular.forEach(dateArr, function(val){
                             firebaseSync.syncArray('families/' + familyKey + '/care/activities/date/' + val.$id).$loaded().then(function(entries){
                               if(entries.length > 0)
                                 _dayCount++;
                             });
                           });
                           $timeout(function(){
                               if(_dayCount >= CARE_COMPLETE_COUNT) {
                                 _fser.setSectionState('care', familyKey, 'completed');
                               }
                           }, 2000);
                          }
                       });
                     }
                   });
                 }

		             def.resolve(firebaseSync.syncObject('families/' + familyKey + '/' + section + '/state/current'));
		           } else {
		             def.resolve(null);
		           }
		        });
				return def.promise;
			},

			setSectionState: function(section, familyKey, curstate) {
				var stateObjRaw = firebaseSync.syncObject('families/' + familyKey + '/' + section + '/state');
				stateObjRaw.$loaded().then(function(stateObj) {
					var oldCur = stateObj.current ;
					stateObj.current = curstate;
					stateObj.last = oldCur;
					stateObj.changed = new Date().toISOString();
					stateObj.$save();
				});
			},

			printOutRequestStates: {
				// requested: when Express app responses with an ack to the main app
				// recieved: when PDF ionic app receives or is injected w/ request and auth apyload
				// prepared: when PDF ionic app completes fetching all FB data to populate PDF HTML
				// generated: when Express app generates PDF and sends signal back to the PDF ionic app
				// also then set 'created': true
				// sent: ?
				// changed: with each update
				// filename: PDF filename when 'state': generated
					initialised: 'initialised',
					requested: 'requested',
					recieved: 'recieved',
					prepared: 'prepared',
					generated: 'generated',
					prioritize: function(state1, state2){
						var priorityArray = ['initialised', 'requested', 'recieved', 'prepared', 'generated'];
						return priorityArray.indexOf(state1) - priorityArray.indexOf(state2);
					},
					isPdfGenerateState: function(state) {
						var self = this;
						return state == self.generated;
					}
			},

			createPrintOutRequest: function(familyKey, requestPayload) {
				var familyPrintoutReqRefPath = 'families/' + familyKey + '/printout/requests';

				/*
					{ state: 'initialised', created: changed: }
					state [requested, recieved, prepared, generated]
					state [initialised, requested, recieved, prepared, generated]
					requests/ID/state
					ok, about the recieved state: lets skip it. its not needed, you are right
					so 'requested' when starting second app,
					and 'prepared' when second app put all the data into html as a last promise.
					'created' when PDF is really generated.
					at one point we should store the filename of the PDF,
					so we can use it later on when sending email with attachment
					so maybe we store this in the request/ID/ node as well
				*/

				var self = this;

				var printoutInitReq = {
					state: {
						current: self.printOutRequestStates.initialised,
						last: false,
						changed: new Date().toISOString(),
					},
					created: new Date().toISOString(),
					payload: {
						timeframe: {
							start: requestPayload.dateRange.start,
							end: requestPayload.dateRange.end
						},
						sections: {

						}
					}
				};
				var enabledSecPromises = [];
				requestPayload.sections.forEach(function(eachSection){
					if(eachSection.enabled === true) {
							var deferred = $q.defer();
							deferred.resolve(eachSection.key);
							enabledSecPromises.push(deferred.promise);
					}
				});

				return $q.all(enabledSecPromises).then(function(vals){
					for(var i=0; i < vals.length; i++ ) {
						printoutInitReq.payload.sections[vals[i]] = true;
					}
					return $firebase(firebaseSync.ref(familyPrintoutReqRefPath + '/')).$push(printoutInitReq);
				});
			},

			getAllPrintOutRequests: function(familyKey) {
				var familyAllPrintoutReqRefPath = 'families/' + familyKey + '/printout/requests';
				return firebaseSync.syncArray(familyAllPrintoutReqRefPath);
				//return firebaseSync.syncObject(familyAllPrintoutReqRefPath).$loaded();
			},

			getPrintOutRequest: function(familyKey, requestId) {
				var familyPrintoutReqRefPath = 'families/' + familyKey + '/printout/requests/' + requestId;
        		console.log(familyPrintoutReqRefPath);
				return firebaseSync.syncObject(familyPrintoutReqRefPath);
			},

			updatePrintOutRequestState: function(familyKey, requestKey, printReqState, pdfFileName) {
				var self = this;
				var def = $q.defer();
				return self.getPrintOutRequest(familyKey, requestKey).$loaded().then(
					function(printOutReqObj) {
						var update = true;
						var errStr = '';
            //console.log(printOutReqObj);
						if (self.printOutRequestStates.prioritize(
							printReqState,
							printOutReqObj.state.current) == 1) { // only one at a time...
							printOutReqObj.state.last = printOutReqObj.state.current;
							printOutReqObj.state.current = printReqState;
						} else {
							errStr = "State transition rules doesn't allow you to go back or move ahead more than a step!!";
							errStr += "\nCurrent state: " + printOutReqObj.state.current + "...";
							errStr += "\nGiven state to update: " + printReqState + "...";
							update = false;
						}

						if ( pdfFileName !==undefined ) {
							if(self.printOutRequestStates.isPdfGenerateState(printReqState)
								&& new RegExp("^([A-Z|0-9|a-z].*\.(pdf$))").test(pdfFileName)) {
								printOutReqObj.filename = pdfFileName;
							} else {
								errStr += "\nIs not PDF generated state: " + printReqState + "...";
								errStr += "\nOr is not a valid PDF file name: " + pdfFileName + "...";
								update = false;
							}
						}

						if(update) {
							printOutReqObj.state.changed = new Date().toISOString();
							return printOutReqObj.$save();
						}

						def.reject(errStr);
						return def.promise;

					},
					function(err) {
					def.reject(err);
	      			return def.promise;
					});
			},

			getFamilyCareMinsStatsCB: function() {

				var familyCareStatsArgs = arguments;

				var careStatsCB = function(calcMinutes, careActivityDateNode) {

					var mins = calcMinutes;
					var dateNodeId = careActivityDateNode.$id;

					var catConstraints = [];
					var actConstraints = [];
					var startDateConstraint;
					var endDateConstraint;

					switch(familyCareStatsArgs.length) {

						case 4:
						endDateConstraint = familyCareStatsArgs[3];
						// Fall through
						case 3:
						startDateConstraint = familyCareStatsArgs[2];
						// Fall through
						case 2:
						actConstraints = familyCareStatsArgs[1];
						// Fall through
						case 1:
						catConstraints = familyCareStatsArgs[0];
						break;

						default:
						break;

					}

					return mins + _.reduce(careActivityDateNode, function(res, activitiesNode){

								var dateConstraintCheck = function(daytoCheck, daytoCheckAgainst, afterCheck) {

									var works = false;
									var funcName = 'isBefore';
									if(afterCheck) {
										funcName = 'isAfter';
									}

									var daytoCheckMoment = moment(daytoCheck);

									if(daytoCheckAgainst != undefined || daytoCheckAgainst != null) {
										var daytoCheckAgainstMoment = moment(moment(new Date(daytoCheckAgainst)).format("YYYY-MM-DD"));


										if(moment.isMoment(daytoCheckAgainstMoment)) {
											if(daytoCheckMoment[funcName](daytoCheckAgainstMoment, 'day')
												|| daytoCheckMoment.isSame(daytoCheckAgainstMoment, 'day')) {
												works = true;
											} else {
												// Breaking point
											}
										} else {
											works = true;
										}
									} else {
										works = true;
									}

									return works;
								};

								// if the activities node is an object with the prop category.id & activity.id
								if(typeof activitiesNode == 'object' && 
									activitiesNode != null && 
									activitiesNode.hasOwnProperty("category") &&
									activitiesNode.hasOwnProperty("activity") &&
									(!Array.isArray(catConstraints) || catConstraints.length  == 0 ||
									catConstraints.indexOf(activitiesNode.category.id) != -1) &&
									(!Array.isArray(actConstraints) || actConstraints.length  == 0 ||
									actConstraints.indexOf(activitiesNode.activity.id) != -1)
									) {

									if( dateConstraintCheck(dateNodeId, startDateConstraint, true) &&
										dateConstraintCheck(dateNodeId, endDateConstraint) ) {
										res += moment.duration({
                                                  minutes: activitiesNode.minutes,
                                                  hours: activitiesNode.hours
                                              }).asMinutes();
									}

								}else {
									//
								}

						 	return res;

					},0);
				};

				return careStatsCB;
			},

			checkCareLevel0: function(familyKey, numOfChallenges) {

				var competencyQARef = firebaseSync.syncArray('families/' + familyKey + '/competency/answers');
				var neverKey = competencyQuestionsDataService.getNeverKey();
				var _numOfChallenges = numOfChallenges || 2;
				var competencyPositiveSet = [];
				
				return competencyQARef.$loaded().then(function(answers) {
					
					 for(var aix = 0; aix < answers.length; aix++) {
					 		var val = answers[aix];
        
			                if (typeof val == 'object' && 
			                	val.hasOwnProperty('option') && 
			                	val.option != neverKey) {

			                		competencyPositiveSet.push(val);

				                	// break early
				                	if(competencyPositiveSet.length == _numOfChallenges) 
				                		break;

			                }
			          }

			          return competencyPositiveSet.length >= _numOfChallenges ? competencyPositiveSet : false;
				});

			},

			checkCareLevel1: function(familyKey) {
				var catsToCheckArr = ['body', 'nutrition', 'mobility'];
				var minutesToCalc = 45;
				var numOfCatsToCheck = 2;
				var self = this;

				if(familyKey != undefined && familyKey != null) {
					// for a specific family
					return careLevel1Func.apply(self, [familyKey, catsToCheckArr, minutesToCalc, numOfCatsToCheck]);
				}

				return;
			},

			checkCareLevel2: function(familyKey) {
				var overallMinsToCalc = 180;
				//var overallMinsToCalc = 124;
				var allCatstoCheckArr = ['body', 'nutrition', 'mobility', 'household'];
				var catsToCheckArr = ['body', 'nutrition', 'mobility'];
				var minutesToCalc = 121;
				//var minutesToCalc = 45;
				var numOfCatsToCheck = 2;
				var self = this;
				
				if(familyKey != undefined && familyKey != null) {
					// for a specific family
					 return careLevel1Func.apply(self, [familyKey, allCatstoCheckArr, overallMinsToCalc, allCatstoCheckArr.length]).then(
					 	function(overallResCheck){
					 		if(!overallResCheck) {
					 			return false;
					 		} else {
					 			return careLevel1Func.apply(self, [familyKey, catsToCheckArr, minutesToCalc, numOfCatsToCheck]).then(
					 				function(finalResCheck){
					 					return finalResCheck;
					 				});
					 		}
					 	});
				}
				return;
			},

			checkCareLevel3: function(familyKey, percentage) {
				//var overallMinsToCalc = 300;
				var overallMinsToCalc = 15;
				var allCatstoCheckArr = ['body', 'nutrition', 'mobility', 'household'];
				var catsToCheckArr = ['body', 'nutrition', 'mobility'];
				//var minutesToCalc = 240;
				var minutesToCalc = 5;
				var numOfCatsToCheck = 2;
				//var _percentage = Number(percentage) || 60;
				var _percentage = Number(percentage) || 2;
				var daySlice = 'night';
				var self = this;
				
				if(familyKey != undefined && familyKey != null && _percentage > 0) {
					// for a specific family
					 return careLevel1Func.apply(self, [familyKey, allCatstoCheckArr, overallMinsToCalc, allCatstoCheckArr.length]).then(
					 	function(overallResCheck){
					 		if(!overallResCheck) {
					 			return false;
					 		} else {
					 			return careLevel1Func.apply(self, [familyKey, catsToCheckArr, minutesToCalc, numOfCatsToCheck]).then(
					 				function(semiFinalResCheck) {

					 					if(!semiFinalResCheck) {
					 					 	return false;
					 					}
					 					
					 					var finalResCheck = [];

					 					for(var ix = 0; ix < semiFinalResCheck.length; ix++) {
					 						
					 						var dayStatsArr = semiFinalResCheck[ix]['groupByDay'];
						 					var totalNumDays = _.size(dayStatsArr);
						 					var daySliceCount = 0;

						 					if(totalNumDays > 0) {

						 						for(var dayKey in dayStatsArr) {
						 							if(dayStatsArr[dayKey].hasOwnProperty(daySlice)) {
						 								daySliceCount++;
						 							}
						 						}

						 						var _resPct = (daySliceCount / totalNumDays) * 100;
						 					
						 						if(_resPct >= _percentage) {
						 							finalResCheck.push(semiFinalResCheck[ix]);
						 							break;
						 						}
						 					}
					 					}

					 					return false;

					 				});
					 		}
					 	});
				}

				var def = $q.defer();
				def.reject('Invalid argument set!!');
				return def.promise;
			},

			checkCareLevelBasis: function(minutesToCalc, numOfCatsToCheck, familyKey, startDate, endDate, catsToCheckArr, actsToCheckArr) {
				
				if(minutesToCalc == undefined || 
					minutesToCalc == null || 
					numOfCatsToCheck == undefined || 
					numOfCatsToCheck == null ||
					familyKey == undefined ||
					familyKey == null) {
					throw new Error('What!!??');
				}


				var self = this;
				return self.nCkFamilyCareCatStat(
			          numOfCatsToCheck, 
			          familyKey,
			          startDate,
			          endDate,
			          catsToCheckArr,
			          actsToCheckArr
			          ).then(
			          function(data){
			          
			            var potentialMilestoneReached = [];
			            
			            data.forEach(function(val, idx) {
			               // console.log('!!! val @#### ');
			               	//console.log(val);

			                if(_.reduce(val['groupByCat'], function(memo, catStat, index,list) {
			                  if(catStat.averageMinsPerday >= minutesToCalc) {
			                    // if any cat stat is more than the mins to calc 
			                    // force it to quit this combo
			                    return 0;
			                  }
			                  return memo + catStat.averageMinsPerday;
			                },0) > minutesToCalc) {
			                  potentialMilestoneReached.push(val);
			                }

			            });  

			            return potentialMilestoneReached.length > 0 ? potentialMilestoneReached : false;       

			        });

			},

			// On the lines of nCr // combination formula: n!/(n-r)!*r!
			nCkFamilyCareCatStat: function(numOfCatsToCheck, familyKey, startDate, endDate, catsToCheckArr, actsToCheckArr) {

				if(numOfCatsToCheck == undefined || 
					numOfCatsToCheck == null ||
					familyKey == undefined ||
					familyKey == null) {
					throw new Error('What!!??');
				}

				var self = this;

		        function setACombination(ar, len, elements) {
		            var i;
		            var combiArr = [];
		            for (i = 0; i < len; i++) {
		              combiArr.push(elements[ar[i]]);
		            }
		            return combiArr;
		        }

		        function combinator(ar, n, k) {
		          var finished = 0;
		          var changed = 0;
		          var i;
		          if (k > 0) {
		            for (i = k - 1; !finished && !changed; i--) {
		              if (ar[i] < (n - 1) - (k - 1) + i) {
		                // Increment this element
		                ar[i]++;
		                if (i < k - 1) {
		                  //  elements in a linear sequence
		                  var j;
		                  for (j = i + 1; j < k; j++) {
		                    ar[j] = ar[j - 1] + 1;
		                  }
		                }
		                changed = 1;
		              }
		              finished = i == 0;
		            }
		            if (!changed) {
		              // Reset to first/init combination
		              for (i = 0; i < k; i++) {
		                ar[i] = i;
		              }
		            }
		          }
		          return changed;
		        }


		        if(Array.isArray(catsToCheckArr) &&
			            	catsToCheckArr.length  > 0 && numOfCatsToCheck > catsToCheckArr.length) {
		        	// if there is an array to check for override the numOfCatsToCheck
		        	// as this makes more sense in such a scenario..
		        	// basically an input handling logical check..

		        	numOfCatsToCheck  = catsToCheckArr.length;

		        }

		   		numOfCatsToCheck--; // cos' if its 3 I want 0,1,2

		        var numbers = [];
		        for(var num = numOfCatsToCheck; num >= 0; num--) {
		          // so it's sorted asc to desc
		          numbers.push(numOfCatsToCheck - num);
		        }

		        var k = numbers.length;

		        return careCategoriesDataService.getCategories().$loaded().then(
		          function(catData) {
		            var combiSetPromises = [];
		            var elements = [];
		            catData.forEach(function(eachCat){
		            	var __eachCat = eachCat.$id;
			            if(!Array.isArray(catsToCheckArr) ||
			            	catsToCheckArr.length  == 0 ||
							catsToCheckArr.indexOf(__eachCat) != -1) {
			            		  elements.push(__eachCat);
			          	}
		            });

		            //console.log(' !!! elements -- ');
		            //console.log(elements);

		            var n = elements.length;

		             do {
		                var combiArr = setACombination(numbers, k, elements);

		                //console.log(combiArr);

		                var _familyCareStatCombo = self.familyStat(
		                							familyKey,
		                							startDate,
		                							endDate,
		                							combiArr.map(function(item){
									                  return item;
									                }),
									                actsToCheckArr);
		                combiSetPromises.push(_familyCareStatCombo.filter().results());
		                // Can break out if a combo satisfies!!
		              } while (combinator(numbers, n, k));

		            return $q.all(combiSetPromises).then(function(arr) {
		               return arr;
		            });

		          },
		          function(err) {
		          	console.log('!! Error in combinator hell !! ~~');
		          	console.log(err);
		          });
		    },

			familyStat: function(family, startDate, endDate, categoryArr, actsArr) {


				if(family == undefined ||
					family == null) {
					throw new Error('What!!??');
				}

				function __familyStat(family, startDate, endDate, categoryArr, actsArr) {

					this.family = family;
					this.startDate = startDate;
					this.endDate = endDate;
					this.categoryArr = categoryArr;
					this.actsArr = actsArr;

					this.constrainedFamilyActsFBArr = careActivitiesDataService.getAllFamilyActivities(
														this.family,
														this.endDate,
														this.startDate
													);
					this.res = $q.defer();

				}

				__familyStat.prototype.results = function() {
					return this.res.promise;
				}

				/**
				* Get a categories total minutes or
				* total minutes for a group of categories
				*/
				__familyStat.prototype.getCategoryMins = function() {
					var catArray = Array.prototype.slice.call(arguments, 0);
					var statMins = 0;

					return this.res.promise.then(function(statRes) {
						for (var catId in catArray) {
							if(statRes['groupByCat'][catArray[catId]] != undefined) {
		              			statMins += statRes['groupByCat'][catArray[catId]]['totalMins'];
		              		}
						}
		              	return statMins;
		            });
				}

				/**
				* Get a actvities total minutes or
				* total minutes for a group of activities
				*/
				__familyStat.prototype.getActivitiesMins = function() {
					var actArray = Array.prototype.slice.call(arguments, 0);
					var statMins = 0;
					return this.res.promise.then(function(statRes) {
						statMins += statRes['groupByCat'][actArray[1]]['activityStats'][actArray[0]]['totalMins'];
		              	return statMins;
		            });
				}

				__familyStat.prototype.filter = function(categoryArr, actsArr) {
					var _categoryArr = categoryArr || this.categoryArr;
					var _actsArr = actsArr || this.actsArr;
					var _constrainedFamilyActsFBArr = this.constrainedFamilyActsFBArr;
					var _startDate = this.startDate;
			        var _endDate = this.endDate;
			        var _res = this.res
					var appCareActsFBArr = careActivitiesDataService.getActivities();

					// the real filtering & first level filtering
					var getFamilyCareStatsCB = function() {

						var familyCareStatsArgs = arguments;

						var careStatsCB = function(calcArray, careActivityDateNode) {

							var statsArr = calcArray;

							var catConstraints = [];
							var actConstraints = [];
							var startDateConstraint;
							var endDateConstraint;

							switch(familyCareStatsArgs.length) {

								case 4:
								endDateConstraint = familyCareStatsArgs[3];
								// Fall through
								case 3:
								startDateConstraint = familyCareStatsArgs[2];
								// Fall through
								case 2:
								actConstraints = familyCareStatsArgs[1];
								// Fall through
								case 1:
								catConstraints = familyCareStatsArgs[0];
								break;

								default:
								break;

							}

							return statsArr.concat(_.reduce(careActivityDateNode,
								function(res, activitiesNode, activitiesNodeIndex, allNodes) {

										var dateConstraintCheck = function(daytoCheck, daytoCheckAgainst, afterCheck) {

											var works = false;
											var funcName = 'isBefore';
											if(afterCheck) {
												funcName = 'isAfter';
											}

											var daytoCheckMoment = moment(daytoCheck);

											if(daytoCheckAgainst != undefined || daytoCheckAgainst != null) {
												var daytoCheckAgainstMoment = moment(moment(new Date(daytoCheckAgainst)).format("YYYY-MM-DD"));


												if(moment.isMoment(daytoCheckAgainstMoment)) {
													if(daytoCheckMoment[funcName](daytoCheckAgainstMoment, 'day')
														|| daytoCheckMoment.isSame(daytoCheckAgainstMoment, 'day')) {
														works = true;
													} else {
														// Breaking point
													}
												} else {
													works = true;
												}
											} else {
												works = true;
											}

											return works;
										};

										// if the activities node is an object with the prop category.id & activity.id
										if(typeof activitiesNode == 'object' && activitiesNode.hasOwnProperty("category") &&
											activitiesNode.hasOwnProperty("activity") &&
											(!Array.isArray(catConstraints) || catConstraints.length  == 0 ||
											catConstraints.indexOf(activitiesNode.category.id) != -1) &&
											(!Array.isArray(actConstraints) || actConstraints.length  == 0 ||
											actConstraints.indexOf(activitiesNode.activity.id) != -1)
											) {

											if( dateConstraintCheck(allNodes.$id, startDateConstraint, true) &&
												dateConstraintCheck(allNodes.$id, endDateConstraint) ) {
													activitiesNode.date = allNodes.$id;
													activitiesNode.id = activitiesNodeIndex;
													res.push(activitiesNode);
											}

										}

								 	return res;

							},[]));
						};
						return careStatsCB;
					};

					var getReducedFamilyActsArr = function(catId, actId) {
						var resArr  = _constrainedFamilyActsFBArr.reduce(
			              getFamilyCareStatsCB(
			              [catId],
			              [actId],
			              _startDate,
			              _endDate),
			            []);
			            resArr.sort(function(a, b) {
			              return  b - a;
			            });
			            return resArr;
       				 };

       				 _res.resolve(appCareActsFBArr.$loaded().then(

       				 	function(activitiesData) {

			                var promises = activitiesData.map(function(value, key) {
			                	var val = {};
			                	var defer = $q.defer();
			                	defer.resolve(val);


			                	if((!Array.isArray(_categoryArr) || _categoryArr.length  == 0 ||
											_categoryArr.indexOf(value.category) != -1) &&
											(!Array.isArray(_actsArr) || _actsArr.length  == 0 ||
											_actsArr.indexOf(value.$id) != -1)
											) {

				                     return _constrainedFamilyActsFBArr.$loaded().then(
				                     	function(_familyCareActData) {					                      
					                      val[value.category] = {};
					                      val[value.category][value.$id] = getReducedFamilyActsArr(value.category, value.$id);
					                      return defer.promise;
					                    });
			                     } else {
			                     	return defer.promise;
			                     }

			        		});


				            return $q.all(promises).then(function(arr) {

				            	var groupedArr = {};
				            	var dayStatArr = {};

				                  for(var k = 0; k < arr.length; k++) {

				                  	var _keyname;

				                    for(var keyname in arr[k]) {

				                    	_keyname = keyname;

				                      for(var activityname in arr[k][keyname]) {

				                      	if(groupedArr[keyname] == undefined) {
				                           groupedArr[keyname] = {};
				                           groupedArr[keyname]['activityStats'] = {};
				                           groupedArr[keyname]['dayStats'] = {};
				                           groupedArr[keyname]['totalMins'] = 0;
				                           groupedArr[keyname]['averageMinsPerday'] = 0;
				                           groupedArr[keyname]['averageMinsPerActiveDay'] = 0;
				                           var distinctDates = [];
				                        }

					                    
				                       groupedArr[keyname]['activityStats'][activityname] = arr[k][keyname][activityname];

				                       // Map/reduce...
				                       var activitiesTotalMins = _.reduce(arr[k][keyname][activityname], function(x,y) {
					                       	if(distinctDates.indexOf(y.date) == -1){
					                       		distinctDates.push(y.date);
					                       	}

					                       	var _ymins = Number(y.minutes);

					                       	if(!groupedArr[keyname]['dayStats'].hasOwnProperty(y.date)) {
					                       		groupedArr[keyname]['dayStats'][y.date] = {};
					                       	}

					                       	if(!groupedArr[keyname]['dayStats'][y.date].hasOwnProperty(y.dayslice)) {
					                       		groupedArr[keyname]['dayStats'][y.date][y.dayslice] = {};
					                       		groupedArr[keyname]['dayStats'][y.date][y.dayslice]['totalMins'] = 0;
					                       	}

					                       	// Group by date/day-slice....
					                       	groupedArr[keyname]['dayStats'][y.date][y.dayslice][y.id] = y;
					                       	groupedArr[keyname]['dayStats'][y.date][y.dayslice]['totalMins'] += _ymins;

					                       
					                       	if(!dayStatArr.hasOwnProperty(y.date)) {
					                       		dayStatArr[y.date] = {};
					                       		dayStatArr[y.date]['totalMins'] = 0;
					                       	}

					                       	if(!dayStatArr[y.date].hasOwnProperty(y.dayslice)) {
					                       		dayStatArr[y.date][y.dayslice] = {};
					                       		dayStatArr[y.date][y.dayslice]['totalMins'] = 0;
					                       	}

					                       	// Group by date/day-slice....
					                       	dayStatArr[y.date][y.dayslice][y.id] = y;
					                       	dayStatArr[y.date][y.dayslice]['totalMins'] += _ymins;
					                       	dayStatArr[y.date]['totalMins'] += _ymins;

					                       	return x + _ymins;
				                        	 
				                        }, 0);

				                        groupedArr[keyname]['totalMins'] += activitiesTotalMins;
				                        groupedArr[keyname]['activityStats'][activityname]['totalMins'] = activitiesTotalMins;

				                        //Parse distinct dates array!!
				                        distinctDates.sort(function(a, b) {
							              return  Date.parse(b) - Date.parse(a);
							            });

							            var timeLineStart;
							            var timeLineEnd;

							            var isValidDate = function(d) {
							            	var timestamp = Date.parse(d);
							            	return !isNaN(timestamp);
							            };

							            if ( _startDate != undefined &&
							             _startDate != null && 
							             !isValidDate(_startDate) ) {
							             	timeLineStart = _startDate;
							            } else {
							            	timeLineStart = distinctDates[0];
							            }

							            if ( _endDate != undefined &&
							             _endDate != null && 
							             !isValidDate(_endDate) ) {
							            	timeLineEnd = _endDate;
							            } else {
							            	timeLineEnd = distinctDates[distinctDates.length-1];
							            }

							            var oneDay = 24*60*60*1000;
							            var diffDays = Math.abs((Date.parse(timeLineStart) - Date.parse(timeLineEnd))/(oneDay));
							          	
							            if(!isNaN(diffDays) && diffDays > 0) {
				                        	groupedArr[keyname]['averageMinsPerday'] = groupedArr[keyname]['totalMins'] / diffDays;
										}

				                        if(distinctDates.length > 0) {
				                        	groupedArr[keyname]['averageMinsPerActiveDay'] = groupedArr[keyname]['totalMins'] / distinctDates.length;
										}



				                      }

				                    }
				                }

				                return {groupByCat: groupedArr, groupByDay: dayStatArr};
				                //return groupedArr;
				             });

				      	}));

					return this;

				}

				return new __familyStat(family, startDate, endDate, categoryArr, actsArr);
			}

		};

	}]);