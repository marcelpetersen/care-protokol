// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var ppApp = angular.module('ppApp', ['ionic', 'ppApp.config','ppApp.controllers',
  'ppApp.services', 'ppApp.directives', 'ppApp.filters', 'angular-peity',
  'angularMoment', 'pascalprecht.translate', 'ngCookies', 'ui.router', 'ngLoggly', 'ngCordova', 'ngCordova.plugins', 'ngCordova.plugins.socialSharing']);

ppApp.run(function($ionicPlatform, $log, $rootScope, $cordovaSocialSharing) {
    $ionicPlatform.ready(function() {

      // Splashscreen
      if (navigator && navigator.splashscreen) {
        navigator.splashscreen.hide();
      }

      $log.info('Boostrapped to IONIC ready');

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }

      if(window.plugins && window.plugins.socialsharing) {
        $rootScope.canShare = true;
        $cordovaSocialSharing.canShareVia('facebook')
          .then(function(result) {
            $rootScope.canShareViaFacebook = true;
          }, function(err) {
          });
        $cordovaSocialSharing.canShareVia('twitter')
          .then(function(result) {
            $rootScope.canShareViaTwitter = true;
          }, function(err) {
          });
        $cordovaSocialSharing.canShareVia('email')
          .then(function(result) {
            $rootScope.canShareViaEmail = true;
          }, function(err) {
          });
        $cordovaSocialSharing.canShareVia('whatsapp')
          .then(function(result) {
            $rootScope.canShareViaWhatsapp = true;
          }, function(err) {
          });
        $cordovaSocialSharing.canShareVia('sms')
          .then(function(result) {
            $rootScope.canShareViaSms = true;
          }, function(err) {
          });

      }

      if(window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .run(['loginService', '$rootScope', 'FBURL', function(loginService, $rootScope, FBURL) {
      if( FBURL === 'https://INSTANCE.firebaseio.com' ) {
        // double-check that the app has been configured
        angular.element(document.body).html('<h1>Please configure app/js/config.js before running!</h1>');
        setTimeout(function() {
          angular.element(document.body).removeClass('hide');
        }, 250);
      }
      else {
        // establish authentication
        $rootScope.auth = loginService.init();
        $rootScope.FBURL = FBURL;
      }

      //listen for ui-router errors
      // @todo: use ENV specific error reporting

      $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
        console.log("stateChangeError:");
        console.log(error);
      });

      $rootScope.$on("$stateNotFound", function(event, unfoundState, fromState) {
        console.log("stateNotFound:");
        console.log(unfoundState);
        console.log(fromState);
      });

    }])

  .run(function(amMoment) {
      // @todo check if still used and set alonog with ng-translate language incl. lang switching
      amMoment.changeLanguage('de');

    moment.lang('de-notime', {
          months : 'Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
          monthsShort : 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
          weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
          weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
          weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
          calendar: {
             lastDay: '[Gestern]',
             sameDay: '[Heute]',
             nextDay: '[Morgen]',
             lastWeek: 'dddd',
             nextWeek: 'dddd',
             sameElse: 'L'
           }
      });
        moment.lang('en-notime', {
               calendar: {
                 lastDay: '[Yesterday]',
                 sameDay: '[Today]',
                 nextDay: '[Tomorrow]',
                 lastWeek: 'dddd',
                 nextWeek: 'dddd',
                 sameElse: 'L'
               }
             });
    })

  .run(['gamificationService', function(gamificationService) {
      // init gamification nodes
      gamificationService.init().then(function(gamificationNode){
        console.log('Init gamification items, success!!');
      },
      function(err){
        if(err) {
          console.log('Something went wrong while checking for gamification node!!');
        } else {
          console.log('Gamification node already set-up!!');
        }
      });

    //gamificationService.initMilestoneNext('knapp', 'printout').then(function(c){console.log(c);}, function(x){console.log(x);});

    }])

/*
.run(['$state', '$stateParams', function($state, $stateParams) {
    //this solves page refresh and getting back to state
    //https://github.com/angular-ui/ui-router/issues/105
    //not working for me ...
  }])
   moment.lang('de-notime', {
        calendar: {
          lastDay: '[Gestern]',
          sameDay: '[Heute]',
          nextDay: '[Morgen]',
          lastWeek: 'dddd',
          nextWeek: 'dddd [at] LT',
          sameElse: 'L'
        }
      });
*/

  .run(['$rootScope', '$state', 'loginService', function ($rootScope, $state, loginService) {

      $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

          if(!('data' in toState) || !('access' in toState.data)){
              $rootScope.error = "Access undefined for this state";
              event.preventDefault();
          }
          else if (!loginService.authorize(toState.data.access)) {
              $rootScope.error = "Seems like you tried accessing a route you don't have access to...";
              event.preventDefault();
            if(fromState.url === '^') {
              loginService.isLoggedIn().then(function(ret){
                if(!ret) {
                  $rootScope.error = null;
                  $state.go('app.login');
                } else {
                  if(typeof(toState) == 'object' && (toState.name !== undefined || toState.name != null)) {
                    $state.go(toState.name);
                  } else {
                    $state.go('app.home');
                  }
                }
              });
            } else {
              loginService.isLoggedIn().then(function(ret){
                if(!ret) {
                   $rootScope.error = null;
                   $state.go('app.login');
                 }
              });
            }
          }
      });

  }])

.config( function(LogglyLoggerProvider) {
    return;
    LogglyLoggerProvider.inputToken('57e778c9-9ec5-4e49-82a6-b338f6039f91')
      .useHttps( true )
      .includeTimestamp( true )
      .includeUrl( true );
})
;

