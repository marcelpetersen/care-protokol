/**
 * Created by anisur on 04/09/14.
 */

ppApp.config(function($stateProvider, $urlRouterProvider) {
  var access = routingConfig.accessLevels;
  $stateProvider

     .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl',
      data: {
          access: access.public
      }
    })

    .state('app.tabs', {
      url: "/tabs",
      views: {
        'menuContent' : {
          templateUrl: "templates/tabs.html"
        }
      }
    })

    .state('app.home', {
      url: "/home",
      views: {
        'menuContent' :{
          templateUrl: "templates/home.html",
          controller: 'HomeCtrl'
        }
      },
      resolve: {
        careCount: function (careActivitiesDataService, usersService) {
          return usersService.getFamilyForCurrentUser().then(function(famObj){
              if(famObj == null) return false;
              return careActivitiesDataService.getDayCount(famObj.$value);
            }, function(error){
              console.log(error);
              return false;
            });
        },
        drugList: function(medicationDataService, usersService) {

          return usersService.getFamilyForCurrentUser().then(function(famObj){
                if(famObj == null)
                  return false;
                return medicationDataService.getDrugListLimited(famObj.$value, 2);
              }, function(error){
            console.log(error);
            return false;
          });

        },
        drugCount: function(medicationDataService, usersService) {
          return usersService.getFamilyForCurrentUser().then(function(famObj){
              if(famObj == null) return false;
              return medicationDataService.getDrugCount(famObj.$value);
            }, function(error){
                        console.log(error);
                        return false;
                      });

        },
        careState: function(familiesService, usersService){
          return usersService.getFamilyForCurrentUser().then(function(famObj){
            if(famObj == null) return false;
               return familiesService.getSectionState('care', famObj.$value);
            }, function(error){
               console.log(error);
               return false;
             });
        },
        competencyState: function(familiesService, usersService){
          return usersService.getFamilyForCurrentUser().then(function(famObj){
              if(famObj == null) return false;
              return familiesService.getSectionState('competency', famObj.$value);
            }, function(error){
                        console.log(error);
                        return false;
                      });

        },
        medicationState: function(familiesService, usersService){
          return usersService.getFamilyForCurrentUser().then(function(famObj){
              if(famObj == null) return false;
              return familiesService.getSectionState('medication', famObj.$value);
            }, function(error){
                        console.log(error);
                        return false;
                      });

        },
        tipState: function(familiesService, usersService){
         return usersService.getFamilyForCurrentUser().then(function(famObj){
              if(famObj == null) return false;
              return familiesService.getSectionState('tip', famObj.$value);
            }, function(error){
                        console.log(error);
                        return false;
                      });

        }
      },
      data: {
          access: access.public
      }

    })

    .state('app.about', {
      url: "/about",
      views: {
        'menuContent' :{
          templateUrl: "templates/about.html"
        }
      }
    })

    .state('app.contact', {
      url: "/contact",
      views: {
        'menuContent' :{
          templateUrl: "templates/contact.html"
        }
      }
    })

    .state('app.login', {
      url: "/login",
      views: {
        'menuContent' :{
          templateUrl: "templates/login.html",
          controller: "LoginCtrl"
        }
      }
    })
    .state('app.account', {
      url: "/account",
      views: {
        'menuContent' :{
          templateUrl: "templates/account.html"
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.account.dashboard', {
      url: "/dashboard",
      views: {
        'accountContent' :{
          templateUrl: "templates/account/dashboard.html",
          controller: "AccountCtrl"
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.account.families', {
        url: "/families",
        views: {
          'accountContent' :{
            templateUrl: "templates/account/families.html",
            controller: "AccountCtrl"
          }
        },
      data: {
          access: access.user
      }
    })

    .state('app.care', {
      url: "/care",
      views: {
        'menuContent' :{
          templateUrl: "templates/care.html"
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.dashboard', {
      url: "/dashboard",
      views: {
        'careContent' :{
          templateUrl: "templates/care/dashboard.html",
          controller: 'CareCtrl'
        }
      },
      resolve: {
        // @todo: remove hardcoded family and get real user
        activityList: function(careActivitiesDataService, usersService) {
         return usersService.getFamilyForCurrentUser().then(function(famObj){
            if(famObj == null) return false;
            return careActivitiesDataService.getFamilyActivities(famObj.$value, moment(new Date()).format('YYYY-MM-DD'));
          }, function(error){
            console.log(error);
            return false;
          });
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.timeline', {
      url: "/timeline",
      params: {
        startDate: {value: null},
        endDate: {value: null}
      },
      views: {
        'careContent' :{
          templateUrl: "templates/care/timeline.html",
          controller: 'CareTimelineCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.category', {
      //url: "/category/:categoryId/:action",
      url: "/category/:categoryId",
      views: {
        'careContent' :{
          templateUrl: "templates/care/category.html",
          controller: 'CareCategoryCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.categories', {
      url: "/categories/:action",
      views: {
        'careContent' :{
          templateUrl: "templates/care/categories.html",
          controller: 'CareCategoriesCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.activity', {
      url: "/activity/:activityId",
      views: {
        'careContent' :{
          templateUrl: "templates/care/activity.html",
          controller: 'CareActivityCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.activities', {
      url: "/activities/:categoryId/",
      views: {
        'careContent' :{
          templateUrl: "templates/care/activities.html",
          controller: 'CareActivitiesCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.favorites', {
      url: "/favorites",
      views: {
        'careContent' :{
          templateUrl: "templates/care/favorites.html",
          controller: 'CareFavoritesCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.add-favorite', {
      url: "/add-favorite",
      views: {
        'careContent' :{
          templateUrl: "templates/care/add-favorite.html",
          controller: 'CareAddFavoritesCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.entries', {
          url: "/entries/:date/:activityId/:type",
          views: {
              'careContent' :{
                  templateUrl: "templates/care/entries.html",
                  controller: 'CareActivityEntriesCtrl'
              }
          },
      data: {
          access: access.user
      }
    })

    .state('app.care.addentry', {
      url: "/addentry/:activityId",
      views: {
        'careContent' :{
          templateUrl: "templates/care/add-edit-entry.html",
          controller: 'CareActivityEntryAddEditCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.entrydetail', {
      url: "/entrydetail/:activityId/:entryId",
      views: {
        'careContent' :{
          templateUrl: "templates/care/add-edit-entry.html",
          controller: 'CareActivityEntryAddEditCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.add', {
      url: "/add/:date/:categoryId/:activityId",
      //abstract: true,
      params: {
        date: {value: null},
        categoryId: {value: null},
        activityId: {value: null}
      },
      views: {
        'careContent' :{
          templateUrl: "templates/care/add.html",
          controller: 'CareAddCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.select-category', {
      url: "/select-category",
      params: {
        date: {value: null}
      },
      resolve: {
        categories: function(careCategoriesDataService) {
          return careCategoriesDataService.getCategories();
        }
      },
      views: {
        'careContent' :{
          templateUrl: "templates/care/add-category.html",
          controller: 'CareAddCategoryCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.select-activity', {
      url: "/select-activity/:id",
      params: {
       id: {value: null}
      },
      resolve: {
        category: function(careCategoriesDataService, careEntryData) {
          return careEntryData.geCategory();
        },
        activities: function (careActivitiesDataService, category) {
            return careActivitiesDataService.getActivitiesByCategory(category.$id);
        }
      },
      views: {
        'careContent' :{
          templateUrl: "templates/care/add-activities.html",
          controller: 'CareAddActivityCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.entry', {
      url: "/entry/:id",
      params: {
       id: {value: null}
      },
      resolve: {
        careEntryData: function(careEntryData) {
          return careEntryData;
        }
      },
      views: {
        'careContent' :{
          templateUrl: "templates/care/add-entry.html",
          controller: 'CareAddEditEntryCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.care.difficulties', {
        url: "/difficulties",
        views: {
          'careContent' :{
            templateUrl: "templates/care/difficulties.html",
            controller: 'CareDifficultiesCtrl'
          }
        },
        data: {
            access: access.user
        }
      })

    .state('app.care.select-difficulty', {
           url: "/select-difficulty",
           views: {
             'careContent' :{
               templateUrl: "templates/care/select-difficulty.html",
               controller: 'CareSelectDifficultyCtrl'
             }
           },
           data: {
               access: access.user
           }
         })

    .state('app.care.difficulty', {
      url: "/difficulty/:entryId",
      params: {
        entryId: {value: null}
      },
      views: {
        'careContent' :{
          templateUrl: "templates/care/add-difficulties.html",
          controller: 'CareAddEditDifficultyCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

/* competency begin */

    .state('app.competency', {
      url: "/competency",
      views: {
        'menuContent' :{
          templateUrl: "templates/competency.html"
        }
      },
      data: {
          access: access.user
      }
    })

    .state('app.competency.dashboard', {
      url: "/dashboard",
      views: {
        'competencyContent' :{
          templateUrl: "templates/competency/dashboard.html",
          controller: 'CompetencyCtrl'
        }
      },
      data: {
          access: access.user
      }
    })

  .state('app.competency.questionnaire', {
		url: "/questionnaire",
      views: {
        'competencyContent' :{
          templateUrl: "templates/competency/questionnaire.html",
          controller: 'CompetencyQuestionsCtrl'
          }
       },
       data: {
          access: access.user
      }
	  })

/* competency end */

    .state('app.coach', {
      url: "/coach",
      views: {
        'menuContent' :{
          templateUrl: "templates/coach.html"
        }
      }
    })

    .state('app.coach.coaching', {
      url: "/coaching/:coachingId",
      views: {
        'coachContent' :{
          templateUrl: "templates/coach/coaching.html",
          controller: 'CoachCoachingCtrl'
        }
      }
    })


    .state('app.coach.module', {
      url: "/module",
      views: {
        'coachContent' :{
          templateUrl: "templates/coach/module.html",
          controller: 'CoachModuleCtrl'
        }
      }
    })

    .state('app.coach.questionnaire', {
      url: "/questionnaire",
      views: {
        'coachContent' :{
          templateUrl: "templates/coach/module-questionnaire.html",
          controller: 'CoachQuestionnaireCtrl'
        }
      }
    })

    .state('app.coach.module-first', {
      url: "/module-first",
      views: {
        'coachContent' :{
          templateUrl: "templates/coach/module-first.html",
          controller: 'CoachModuleCtrl'
        }
      }
    })

    .state('app.coach.module-second', {
      url: "/module-second",
      views: {
        'coachContent' :{
          templateUrl: "templates/coach/module-second.html",
          controller: 'CoachModuleCtrl'
        }
      }
    })

    .state('app.coach.module-third', {
      url: "/module-third",
      views: {
        'coachContent' :{
          templateUrl: "templates/coach/module-third.html",
          controller: 'CoachModuleCtrl'
        }
      }
    })

    .state('app.medication', {
      url: "/medication",
      views: {
        'menuContent' :{
          templateUrl: "templates/medication.html"
        }
      },
      data: {
                access: access.user
            }
    })

    .state('app.medication.dashboard', {
      url: "/dashboard",
      views: {
        'medicationContent' :{
          templateUrl: "templates/medication/dashboard.html",
          controller: 'MedicationCtrl'
        }
      },
      data: {
                access: access.user
            }
    })

    .state('app.medication.entries', {
      url: "/entries",
      views: {
        'medicationContent' :{
          templateUrl: "templates/medication/entries.html",
          controller: "MedicationCtrl"
        }
      },
      data: {
                access: access.user
            }
    })

    .state('app.medication.addentry', {
      url: "/addentry",
      views: {
        'medicationContent' :{
          templateUrl: "templates/medication/addeditentry.html",
          controller: "MedicationAddEditCtrl"
        }
      },
      data: {
                access: access.user
            }
    })

    .state('app.medication.detail', {
      url: "/detail/:entryId",
      views: {
        'medicationContent' :{
          templateUrl: "templates/medication/addeditentry.html",
          controller: "MedicationAddEditCtrl"
        }
      },
      data: {
                access: access.user
            }
    })

    .state('app.tip', {
      url: "/tip",
      views: {
        'menuContent' :{
          templateUrl: "templates/tip.html"
        }
      }
    })

    .state('app.tip.dashboard', {
      url: "/dashboard",
      views: {
        'tipContent' :{
          templateUrl: "templates/tip/dashboard.html",
          controller: 'TipCtrl'
        }
      }
    })


    .state('app.printout', {
      url: "/printout",
      views: {
        'menuContent' :{
          templateUrl: "templates/printout.html",
          controller: 'PrintoutCtrl'
        }
      }
    })

    .state('app.printout.dashboard', {
      url: "/dashboard",
      views: {
        'printoutContent' :{
          templateUrl: "templates/printout/dashboard.html"
        }
      }
    })

    .state('app.printout.request', {
      url: "/request",
      views: {
        'printoutContent' :{
          templateUrl: "templates/printout/request.html"
        }
      }
    })
    .state('app.printout.archive', {
      url: "/archive",
      views: {
        'printoutContent' :{
          templateUrl: "templates/printout/archive.html",
          controller: 'PrintoutArchiveCtrl'
        }
      },
      resolve: {
        rewardResolution: function(usersService, gamificationService, rewardService, $state, $timeout) {
         // $timeout(function() {
          try{
           usersService.getFamilyForCurrentUser().then(
            function(familyData) {
              if(familyData != null) {
                var familyID = familyData.$value;
                gamificationService.checkMilestone(familyID, 'printout').then(
                  function(rewarded) {
                    console.log('Rewarded!!..here\'s the corresponding \'ref\' object...');
                    console.log(rewarded);
                    rewardService.getRewardedItem(rewarded);
                    rewardService.getGoToState($state.current.name);
                    $state.go('app.family.reward');
                  },
                  function(notRewarded) {
                    console.log('Not Rewarded!!..' + notRewarded);
                  });
              }
            },
            function(err){
              console.log('Can\'t fetch family for current user!!..' + err);
            })
          } catch(e){
                      return false;
                    }
           ;//}, 200);
        }
      }
    })
    .state('app.printout.archiveitem', {
      url: "/archive/:item",
      views: {
        'printoutContent' :{
          templateUrl: "templates/printout/archiveitem.html",
          controller: 'PrintoutArchiveCtrl'
        }
      }
    })

    .state('app.family', {
      url: "/family",
      views: {
        'menuContent' :{
          templateUrl: "templates/family.html"
        }
      }
    })

    .state('app.family.reward', {
      url: "/reward",
      views: {
        'familyContent' :{
          templateUrl: "templates/family/reward.html",
          controller: 'RewardCtrl'
        }
      }
    })


    .state('app.admin', {
      url: "/admin",
      views: {
        'menuContent' :{
          templateUrl: "templates/admin.html"
        }
      },
      data: {
          access: access.admin
      }
    })

    .state('app.admin.dashboard', {
      url: "/dashboard",
      views: {
        'adminContent' :{
          templateUrl: "templates/admin/dashboard.html",
          controller: 'AdminCtrl'
        }
      },
      data: {
          access: access.admin
      }
    })

    .state('app.admin.users', {
        url: "/users",
        views: {
          'adminContent' :{
            templateUrl: "templates/admin/users.html",
            controller: 'AdminCtrl'
          }
        },
        data: {
            access: access.admin
        }
      })

    .state('app.admin.assign', {
        url: "/assign",
        params: {
          userId: {value: null}
        },
        views: {
          'adminContent' :{
            templateUrl: "templates/admin/assign.html",
            controller: 'AdminAssignCtrl'
          }
        },
        data: {
            access: access.admin
        }
      })

    .state('app.admin.competency-ans', {
        url: "/competency-ans",
        params: {
          userId: {value: null}
        },
        views: {
          'adminContent' :{
            templateUrl: "templates/admin/competency-ans.html",
            controller: 'AdminAssignCtrl'
          }
        },
        data: {
            access: access.admin
        }
      })
    ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');

});