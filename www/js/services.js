(function() {
  'use strict';

  /* Services */

  angular.module('ppApp.services', ['ppApp.service.sections', 'ppApp.service.login', 'ppApp.service.users', 'ppApp.service.families', 'ppApp.service.gamification', 'ppApp.service.firebase', 'ppApp.service.firebase.changeEmail', 'ppApp.service.underscore', 'ppApp.service.reward', 'ppApp.service.dateselect'])

  // put your services here!
  // .service('serviceName', ['dependency', function(dependency) {}]);


  .factory('utils', function () {
    return {
      // Util for finding an object by its 'id' property among an array
      findById: function findById(a, id) {
        for (var i = 0; i < a.length; i++) {
          if (a[i].id == id) return a[i];
        }
        return null;
      },

      // Util for returning a randomKey from a collection that also isn't the current key
      newRandomKey: function newRandomKey(coll, key, currentKey){
        var randKey;
        do {
          randKey = coll[Math.floor(coll.length * Math.random())][key];
        } while (randKey == currentKey);
        return randKey;
      }
    };
  })

  .factory("careCategoriesDataService", ['firebaseSync',
    function(firebaseSync) {
      return {
        getCategories : function() {
          return firebaseSync.syncArray('care/categories');
        },
        getCategory : function(category) {
          console.log(category);
          return firebaseSync.syncObject('care/categories/' + category.$id);
        }
      }

    }])

  .factory("careActivitiesDataService",["$filter", '$firebase', 'firebaseSync', 'PRIORITY_TIMESTAMP', '$q', '$timeout',
      function($filter, $firebase, firebaseSync, PRIORITY_TIMESTAMP, $q, $timeout){
      return{
        getFamilyActivities: function(family, date) {
          return firebaseSync.syncArray('families/' + family + '/care/activities/date/' + date);
        },

        getAllFamilyActivities: function(family, startDate, endDate) {
          var _startAt = 1;
          if(startDate != null) {
            _startAt = PRIORITY_TIMESTAMP - startDate.setDate(startDate.getDate()+1);
          }
          var _endAt = PRIORITY_TIMESTAMP;
          if(endDate != null) {
            _endAt = PRIORITY_TIMESTAMP - endDate.getTime();
          }
          var activityRef = firebaseSync.ref('families/' + family + '/care/activities/date').startAt(_startAt).endAt(_endAt);
         // var activityRef = firebaseSync.ref('families/' + family + '/care/activities/date').limit(5).endAt(null, '2014-08-30');
          return $firebase(activityRef).$asArray();
        },


        getActivities: function() {
          //get the activities
          return firebaseSync.syncArray('care/activities');
        },

        getActivitiesByCategory: function(category) {
          //get the activities
          //(activities, {id: activityId})[0]
          var _def = $q.defer();
          firebaseSync.syncArray('care/activities').$loaded().then(function(actArr) {
            //console.log(actArr);
            var filteredArray = $filter('filter')(actArr, {category: category});
            _def.resolve(filteredArray);
          })
          return _def.promise;
        },
        getActivitiesData: function(category){
          //get the activities
          //@using categopry
          var _def = $q.defer();
          var _getActivityDaySlice = this.getActivityDaySlice;
          firebaseSync.syncArray('care/activities').$loaded().then(function(actArr){
            var _activities = [];
            console.log(actArr);
            angular.forEach(actArr, function(value){
              var dayslice = _getActivityDaySlice(value.$id);
              dayslice.then(function(arr){
                value.daysliceCount = arr;

                value.entryCount = arr.length;
                _activities.push(value);
              });
            });
            $timeout(function(){
              _def.resolve(_activities);
            }, 2000);
          });
          return _def.promise;
          /*
          // later on we'll add call to firebase service to fetch data.
          var demoActivities = {
            body: [{ title: 'Ganzkörperwäsche', id: 1, daysliceCount: [5, 2, 3, 3, 4, 5, 3]}
              ,
              { title: 'Teilwäsche', id: 2, daysliceCount: [2, 3, 4, 1, 2, 3, 4] }
              ,
              { title: 'Duschen', id: 3, daysliceCount: [5, 2, 1, 2, 4, 3] }
              ,
              { title: 'Baden', id: 4, daysliceCount: [5, 2, 1, 3, 4, 3] }
              ,
              { title: 'Mund-/Zahnpflege', id: 5, daysliceCount: [3, 2, 3, 2, 3, 2, 2] }
              ,
              { title: 'Kämmen', id: 6, daysliceCount: [2, 3, 1, 0, 5, 3, 2] }
              ,
              { title: 'Rasieren', id: 7, daysliceCount: [5, 4, 2, 5, 4, 5, 4] }
              ,
              { title: 'Blasenentleerung', id: 8, daysliceCount: [3, 2, 2, 2, 4, 2, 1] }
              ,
              { title: 'Darmentleerung', id: 9, daysliceCount: [5, 2, 1, 0, 3, 1, 5, 3] }
              ,
              { title: 'Intimpflege', id: 10, daysliceCount: [4, 3, 5, 4, 2, 3, 4] }
              ,
              { title: 'Kleidung richten', id: 11, daysliceCount: [2, 1, 3, 2, 3, 4, 4] }
              ,
              { title: 'Inkontinenzartikel wechseln', id: 12, daysliceCount: [2, 2, 4, 3, 2, 1, 3] }
              ,
              { title: 'Urin-/Stomabeutel wechseln', id: 13, daysliceCount: [5, 2, 3, 1, 5, 3, 4] }
            ], nutrition: [
              { title: 'Mundgerechte Zubereitung', id: 21, daysliceCount: [5, 2, 3, 3, 4, 5, 3]}
              ,
              { title: 'Essen und Trinken reichen', id: 22, daysliceCount: [2, 3, 4, 1, 2, 3, 4] }
            ], mobility: [
              { title: 'Aufstehen vom Bett', id: 41, daysliceCount: [5, 2, 3, 3, 4, 5, 3]}
              ,
              { title: 'Lagerung', id: 42, daysliceCount: [2, 3, 4, 1, 2, 3, 4] }
              ,
              { title: 'Zubettgehen', id: 43, daysliceCount: [5, 2, 1, 2, 4, 3] }
              ,
              { title: 'Rollstuhl (Aufstehen/Hineinsetzen)', id: 44, daysliceCount: [5, 2, 1, 3, 4, 3] }
              ,
              { title: 'An- und Auskleiden', id: 45, daysliceCount: [3, 2, 3, 2, 3, 2, 2] }
              ,
              { title: 'Bewegen im Haus', id: 46, daysliceCount: [2, 3, 1, 0, 5, 3, 2] }
              ,
              { title: 'Stehen', id: 47, daysliceCount: [5, 4, 2, 5, 4, 5, 4] }
              ,
              { title: 'Treppensteigen', id: 48, daysliceCount: [3, 2, 2, 2, 4, 2, 1] }
              ,
              { title: 'Begleitung (z. B. zum Arzt)', id: 49, daysliceCount: [5, 2, 1, 0, 3, 1, 5, 3] }
            ], household: [
              { title: 'Einkaufen', id: 61, daysliceCount: [5, 2, 3, 3, 4, 5, 3]}
              ,
              { title: 'Kochen', id: 62, daysliceCount: [2, 3, 4, 1, 2, 3, 4] }
              ,
              { title: 'Wohnung reinigen', id: 63, daysliceCount: [5, 2, 1, 2, 4, 3] }
              ,
              { title: 'Spülen', id: 64, daysliceCount: [5, 2, 1, 3, 4, 3] }
              ,
              { title: 'Wechsel der Wäsche', id: 65, daysliceCount: [3, 2, 3, 2, 3, 2, 2] }
              ,
              { title: 'Waschen und Bügeln', id: 66, daysliceCount: [2, 3, 1, 0, 5, 3, 2] }
              ,
              { title: 'Wohnung heizen', id: 67, daysliceCount: [5, 4, 2, 5, 4, 5, 4] }
            ]
          };

          return demoActivities[category];*/

        },
        getActivityDaySlice: function(activityId){
          var _dayslice = [];
          var _def2 = $q.defer();
          firebaseSync.syncArray('families').$loaded().then(function(familyObj){
            angular.forEach(familyObj, function(family){
                firebaseSync.syncArray('families/' + family.$id + '/care/activities/date').$loaded().then(function(dt){
                  if(dt.length > 0) {
                    angular.forEach(dt, function(val){
                      firebaseSync.syncArray('families/' + family.$id + '/care/activities/date/' + val.$id).$loaded().then(function(entries){
                        angular.forEach(entries, function(eVal){
                          firebaseSync.keyExists('families/' + family.$id + '/care/activities/date/' + val.$id + '/' + eVal.$id + '/activity/id').then(function(pathA){
                            if(pathA != null) {
                              firebaseSync.syncObject(pathA).$loaded().then(function(idObj){
                                if (idObj.$value == activityId) {
                                  _dayslice.push(eVal.minutes);
                                }
                              });
                            }
                          });
                        });
                        $timeout(function(){
                          _def2.resolve(_dayslice);
                        }, 2000);
                      });
                    });
                  }
                });
            });
          });
         return _def2.promise;

        },

        getActivity: function(activityId) {

          // only for demo purposes we get body related activities only
          var activities = this.getActivities('body');
          return $filter('filter')(activities, {id: activityId})[0];
        },
        getActivityWithEntry: function(activityId){

          console.log(activityId);
          // later on we'll add call to firebase service to fetch data.
          var mom = moment(new Date());

          // only for demo purposes we get body related activities only
          var activities = this.getActivities('body');
          var activity = $filter('filter')(activities, {id: activityId})[0];
          return {
            id: activity.id,
            title : activity.title,
            entries:
              [
                {id:1, datetime: mom.subtract('days', Math.floor(Math.random() * 10)).toDate(), minutes: 20,   dayslice:"VM", hours:10, type:"TU", user:'Martin', note:""}
                ,{id:2, datetime: mom.subtract('days', Math.floor(Math.random() * 10)).toDate(), minutes: 10,  dayslice:"MI", hours:15, type:"VU", user:'Petra', note:"Sehr unruhig wegen Arzttermin nächste Woche"}
                ,{id:3, datetime: mom.subtract('days', Math.floor(Math.random() * 10)).toDate(), minutes: 21,  dayslice:"AB", hours:16, type:"BE", user:'Martin', note:""}
                ,{id:4, datetime: mom.subtract('days', Math.floor(Math.random() * 10)).toDate(), minutes: 23,  dayslice:"NA", hours:18, type:"UN", user:'Stefanie', note:""}
                ,{id:5, datetime: mom.subtract('days', Math.floor(Math.random() * 10)).toDate(), minutes: 6,   dayslice:"VM", hours:13, type:"VU", user:'Martin', note:""}
                ,{id:6, datetime: mom.subtract('days', Math.floor(Math.random() * 10)).toDate(), minutes: 55,  dayslice:"NA", hours:18, type:"UN", user:'Martin', note:""}
                ,{id:7, datetime: mom.subtract('days', Math.floor(Math.random() * 10)).toDate(), minutes: 60,  dayslice:"AB", hours:25, type:"BE", user:'Martin', note:""}
                ,{id:8, datetime: mom.subtract('days', Math.floor(Math.random() * 10)).toDate(), minutes: 8,   dayslice:"VM", hours:27, type:"TU", user:'Petra', note:""}
                ,{id:9, datetime: mom.subtract('days', Math.floor(Math.random() * 10)).toDate(), minutes: 35,  dayslice:"MI", hours:59, type:"BE", user:'Petra', note:""}
                ,{id:10, datetime: mom.subtract('days', Math.floor(Math.random() * 10)).toDate(), minutes: 45, dayslice:"NA", hours:40, type:"BE", user:'Martin', note:""}
                ,{id:11, datetime: mom.subtract('days', Math.floor(Math.random() * 10)).toDate(), minutes: 7,  dayslice:"AB", hours:30, type:"TU", user:'Stefanie', note:""}
                ,{id:12, datetime: mom.subtract('days', Math.floor(Math.random() * 10)).toDate(), minutes: 20, dayslice:"VM", hours:50, type:"VU", user:'Martin', note:""}
              ]
          };
        },
        getEntry: function(activityId, entryId) {
          var activity = this.getActivityWithEntry(activityId);
          return $filter('filter')(activity.entries, {id: entryId})[0];
        },
        getFamilyActivityEntry: function (family, date) {

          console.log('families/' + family + '/care/activities/date/' + date);

          return firebaseSync.syncArray('families/' + family + '/care/activities/date/' + date);
         /* var _def = $q.defer();
         firebaseSync.syncArray('families/' + family + '/care/activities/date/' + date).$loaded().then(function(objArr){
          _def.resolve(objArr);
         });
          return _def.promise;*/
        },
        getDayCount: function(family) {
          var def = $q.defer();
          firebaseSync.syncArray("families/" + family + "/care/activities/date").$loaded().then(function(dateArr) {
           def.resolve(dateArr.length);
          });
          return def.promise;
        }
      }
    }])

    .factory("competencyQuestionsDataService", ['$rootScope', 'firebaseSync', '$state', '$q', '$timeout', '$log',
      function($rootScope, firebaseSync, $state, $q, $timeout, $log){
		  /* May be these answer options needs to come from firebase and the firebase dependency to add */
		return {
			getQuestions: function() {
				return firebaseSync.syncArray('competency/questions');
			},
			getAnswerOptions: function(){
        var _def = $q.defer();
        firebaseSync.syncArray('competency/answeroptions').$loaded().then(function(arr){
          var _ret = [];
          angular.forEach(arr, function(val){
            _ret.push(val.$id);
          });
          _def.resolve(_ret);
        });
        return _def.promise;
			},
			getNeverKey: function() {
				return 'never';
			},
			saveAllNever: function(user, familyKey) {

				//add all competencies as never
				var questions = this.getQuestions();
				var keyNever = this.getNeverKey();
				var def = $q.defer();
				questions.$loaded().then(function(questions) {
					var ansoption = firebaseSync.syncData('families/' + familyKey + '/competency/answers');
          var answers = [];

					angular.forEach(questions, function(value) {
							//save each data
						var qkey = value.$id;
						var child = {};
						child.option = keyNever;
						child.note = false;
						child.changed = new Date().toISOString();
						child.user = user;
            ansoption.$set(qkey,child).then(function() {
              // but this resolves after only one option set. maybe we should build the full json and then set it as on /answers directly
              // @todo check promise
              def.resolve(ansoption);
            });
					});

				});
				return def.promise;
			},
			getAnsweredQuestion: function(familyKey) {
				var answerRef = firebaseSync.syncArray('families/' + familyKey + '/competency/answers');
				var def = $q.defer();
				var answerArr = [];
				answerRef.$loaded().then(function(arr){
					angular.forEach(arr, function(value){
						firebaseSync.syncObject('competency/questions/' + value.$id).$loaded().then(function(obj){
							answerArr.push({question: obj, answeroption: value});
              //$log.debug(value);
							def.resolve(answerArr);
						});
					});
				});
				return def.promise;
			},
			getCurrentOpenQuestion: function(familyKey) {
				var competencyQuesAnswered = firebaseSync.syncArray('families/' + familyKey + '/competency/answers');
				var def = $q.defer();
				competencyQuesAnswered.$loaded().then(function(ansArr){
					var finishedIndex = ansArr.length;
					firebaseSync.syncArray('competency/questions').$loaded().then(function(qArr){
						var qKey = qArr.$keyAt(finishedIndex);
						def.resolve(firebaseSync.syncObject('competency/questions/' + qKey));
					});

				});
				return def.promise;
			}
		}
	  }])

	  .factory('Family', ['$rootScope', 'firebaseSync', 'FamilyFactory' ,'$q', function($rootScope, firebaseSync, FamilyFactory, $q){
		  	return function(familyKey) {
				var def = $q.defer();
				firebaseSync.keyExists('families/' + familyKey).then(function(path) {
					var famObj = firebaseSync.syncObject(path, {objectFactory : FamilyFactory});
					famObj.$bindTo($rootScope, 'family');
					def.resolve(famObj);
				});
				return def.promise;
			}
	  }])

	  .factory('FamilyFactory', ['$FirebaseObject', function($FirebaseObject){
			return $FirebaseObject.$extendFactory({
				getCompetencyState: function() {
					return this.competency.state.current;
				},
				getKey: function() {
					return this.$id;
				}
			});
	  }])

    .factory("medicationDataService", ["$rootScope", "firebaseSync", "$firebase",
      "$state", "$q", "$timeout",
      function($rootScope, firebaseSync, $firebase, $state, $q, $timeout) {
        return {
          getApplications: function() {
            return[
              {key: 'tablet', text: 'MEDICATION_APP_TABLET'},
              {key: 'syrup', text: 'MEDICATION_APP_SYRUP'},
              {key: 'cream', text: 'MEDICATION_APP_CREAM'},
              {key: 'subcutaneousinjection', text: 'MEDICATION_APP_SUBCUT_INJ'},
              {key: 'intramuscularinjection', text: 'MEDICATION_APP_INTRAMUS_INJ'},
              {key: 'intravenousinjection', text: 'MEDICATION_APP_INTRAVEN_INJ'},
              {key: 'suppository', text: 'MEDICATION_APP_SUPPOSITORY'},
              {key: 'other', text: 'MEDICATION_APP_OTHER'}
            ];
          },
          getInCharge: function() {
            return[
              {key: 'carerecipient', text : 'MEDICATION_INCHR_RECIPIENT'},
              {key: 'caregiver', text : 'MEDICATION_INCHR_GIVER'},
              {key: 'nurse', text : 'MEDICATION_INCHR_NURSE'},
              {key: 'other', text : 'MEDICATION_INCHR_OTHER'}
              ];
          },
          getEntry: function(family, entryId) {
            return firebaseSync.syncObject("families/" + family + "/medication/drugs/" + entryId);
          },
          getHelps: function() {
            return [
              {key: 'false', text: 'MEDICATION_HELP_NO'},
              {key: 'support', text: 'MEDICATION_HELP_SUPPORT'},
              {key: 'partial', text: 'MEDICATION_HELP_PARTIAL'},
              {key: 'full', text: 'MEDICATION_HELP_FULL'},
              {key: 'oversee', text: 'MEDICATION_HELP_OVERSEE'},
              {key: 'coach', text: 'MEDICATION_HELP_COACH'}
            ];
          },
          getDrugCount: function(family) {
            var def = $q.defer();
            $rootScope.auth.$getCurrentUser().then(function(usr){
              if(usr) {
                firebaseSync.syncArray("families/" + family + "/medication/drugs").$loaded().then(function(drugArr) {
                   def.resolve(drugArr.length);
                 });
              } else {
                def.resolve(null);
              }
            });

            return def.promise;
          },
          getDrugListLimited: function(family, count) {
            var def = $q.defer();
              $rootScope.auth.$getCurrentUser().then(function(usr){
                if(usr) {
                  def.resolve(firebaseSync.syncArray("families/" + family + "/medication/drugs", {limit: count, startAt: null}).$loaded());
                } else {
                  def.resolve(null);
                }
              });
            return def.promise;
          },
          getFormErrorKeys: function() {
            return{title: 'MEDICATION_ERR_TITLE',
              amount: 'MEDICATION_ERR_AMOUNT',
              appl: 'MEDICATION_ERR_APPL',
              prescription: 'MEDICATION_ERR_PRESCRIPTION',
              dosage: 'MEDICATION_ERR_DOSAGE',
              taking: 'MEDICATION_ERR_TAKING',
              help: 'MEDICATION_ERR_HELP'};
          }
        }
    }])

    .factory('pickadateUtils', ['dateFilter', function(dateFilter) {
          return {
            isDate: function(obj) {
              return Object.prototype.toString.call(obj) === '[object Date]';
            },

            stringToDate: function(dateString) {
              if (this.isDate(dateString)) return new Date(dateString);
              var dateParts = dateString.split('-'),
                year  = dateParts[0],
                month = dateParts[1],
                day   = dateParts[2];

              // set hour to 3am to easily avoid DST change
              return new Date(year, month - 1, day, 3);
            },

            dateRange: function(first, last, initial, format) {
              var date, i, _i, dates = [];

              if (!format) format = 'yyyy-MM-dd';

              for (i = _i = first; first <= last ? _i < last : _i > last; i = first <= last ? ++_i : --_i) {
                date = this.stringToDate(initial);
                date.setDate(date.getDate() + i);
                dates.push(dateFilter(date, format));
              }
              return dates;
            }
          };
        }])

    .factory('careEntryData', ["$state", "$q", "$timeout", function ($state, $q, $timeout) {

      // this is also in reality a user workflow checker
      // cuz we very well could populate the category if not selected
      // in the activity screen, hitting FB

      var _careEntryRefPathMap = [];
      var _selectedEntry;
      var _category = {};
      var _activity = {};
      var _date = {};

      return {

        getDate: function() {
          return _date;
        },

        setDate: function(date) {
          if(date == null || date == undefined) {
            _date = {};
            return;
          }
          _date = date;
        },

        setCategory: function(category) {
          // reset
          if(category == null || category == undefined) {
            _category = {};
            return;
          }
          _category = category;
          // So can be used as a category item from
          // 1. /care/categories ($id)
          // OR 2. /families/.../care/activities/date/../.../category (id)
          if(!category.hasOwnProperty('$id') && category.hasOwnProperty('id')) {
            _category.$id = category.id;
          }

          if(!category.hasOwnProperty('id') && category.hasOwnProperty('$id')) {
            _category.id = category.$id;
          }
        },

        setActivity: function(activity) {
          // reset 
          if(activity == null || activity == undefined) {
            _activity = {};
            return;
          }
           _activity = activity;
           // So can be used as a category item from
          // 1. /care/activities ($id)
          // OR 2. /families/.../care/activities/date/../.../activity (id)
          if(!activity.hasOwnProperty('$id') && activity.hasOwnProperty('id')) {
            _activity.$id = activity.id;
          }

          if(!activity.hasOwnProperty('id') && activity.hasOwnProperty('$id')) {
            _activity.id = activity.$id;
          }
        },

        geCategory: function() {
          return _category;
        },

        getActivity: function() {
          return _activity;
        },

        // a host of entries...
        addCareEntry: function(careEntryNodeId, parentRefPath) {
          _careEntryRefPathMap[careEntryNodeId] = parentRefPath;
        },

        getCareEntry: function(careEntryNodeId) {
          return _careEntryRefPathMap[careEntryNodeId];
        },

        // one active entry.. not used as of now..
        getSelectedEntry: function(careEntryNodeId) {
          if(careEntryNodeId != undefined || careEntryNodeId != null) {
             _selectedEntry = careEntryNodeId;
          }
          return _selectedEntry;
        }
      };

    }])

    .factory('careDifficultyData', ["firebaseSync", "$state", "$q", "$timeout", function (firebaseSync, $state, $q, $timeout) {

         var _selectedEntry;

         return {

           difficulty: {},

           // one active entry.. not used as of now..
           getSelectedEntry: function(careEntryNodeId) {
             if(careEntryNodeId != undefined || careEntryNodeId != null) {
                _selectedEntry = careEntryNodeId;
             }
             return _selectedEntry;
           },

           getDifficultEntry: function(family, entryId) {
             return firebaseSync.syncObject("families/" + family + "/care/difficulties/" + entryId);
           },
           getFormErrorKeys: function() {
             return{difficulty: 'DIFFICULTIES_ERR_SELECT'};
           },
           getDifficulties: function(family) {
             var _def = $q.defer();
             var _difficulties = [];
             firebaseSync.syncArray("care/difficulties").$loaded().then(function(difArr){
               angular.forEach(difArr, function(difObj){
                 firebaseSync.keyExists("families/" + family + "/care/difficulties/" + difObj.$id).then(function(retStatus){
                   if(retStatus == null) {
                     _difficulties.push(difObj);
                   }
                 });
               });
               $timeout(function(){
                 _def.resolve(_difficulties);
               }, 2000);
             });
             return _def.promise;
           },
           getDifficulty: function(key) {
             return firebaseSync.syncObject("care/difficulties/" + key).$loaded();
           },
           getUserDifficultes: function(family) {
             return firebaseSync.syncArray("families/" + family + "/care/difficulties");
           }

         };

       }])

    .factory("favoriteDataService",["$filter", 'firebaseSync', '$q', '$timeout',
          function($filter, firebaseSync, $q, $timeout) {

          return {
           getFavorites: function(_family, _loggedUser) {

              var _def = $q.defer();
              var _favArr = [];

               firebaseSync.syncArray('care/activities').$loaded().then(function(actArr){
                 angular.forEach(actArr, function(val){
                   firebaseSync.keyExists("families/" + _family + "/users/" + _loggedUser + "/favorites/" + val.$id).then(function(retStr){
                 
                     if(retStr == null) {
                       _favArr.push(val);
                     }

                   });
                 });

                 _def.resolve(_favArr);

               });
             return _def.promise;
           }
          }
     }])
  ;

})();
