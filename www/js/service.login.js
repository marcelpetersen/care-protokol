
angular.module('ppApp.service.login', ['firebase', 'ppApp.service.firebase'])

  .factory('loginService', ['$firebaseSimpleLogin', 'firebaseSync', 'changeEmail', '$timeout', '$q', '$rootScope', '$cookieStore',
    function($firebaseSimpleLogin, firebaseSync, changeEmail, $timeout, $q, $rootScope, $cookieStore) {
      var auth =  $firebaseSimpleLogin(firebaseSync.ref());
      var listeners = [];
      var accessLevels = routingConfig.accessLevels
              , userRoles = routingConfig.userRoles
              , currentUser = $cookieStore.get('user') || { username: '', role: userRoles.public };

      $cookieStore.remove('user');

      function statusChange() {
        fns.getUser().then(function(user) {
          changeUser(user);
          angular.forEach(listeners, function(fn) {
            fn(user||null);
          });
        });
      }

      function changeUser(user) {
        if(user != null) {
          //get the record from firebase
          firebaseSync.syncObject('users/' + user.uid).$loaded().then(function(usrObj){
            if(usrObj.role == 'admin') {
              user.role = userRoles.admin;
            } else {
              user.role = userRoles.user;
            }
            angular.extend(currentUser, user);
            fns.user = currentUser || null;
          });
        }
      }

      var fns = {
        user: null,

       init: function() {
         return auth;
       },

        authorize: function(accessLevel, role) {
          assertAuth();
          if(role === undefined) {
              role = currentUser.role;
          }
          return accessLevel.bitMask & role.bitMask;
        },

        isLoggedIn: function() {
          assertAuth();
          var _def = $q.defer();
          auth.$getCurrentUser().then(function(user){
            if(user === null)
              _def.resolve(false);
            else if(user.uid != null) {
              changeUser(user);
              $timeout(function(){
                 _def.resolve(fns.user.role.title === userRoles.user.title || fns.user.role.title === userRoles.admin.title);
              }, 2000);
            } else {
              _def.resolve(false);
            }
          });

          return _def.promise;
        },

        getUser: function() {
          assertAuth();
          return auth.$getCurrentUser();
        },

        /**
         * @param {string} email
         * @param {string} pass
         * @returns {*}
         */
        login: function(email, pass, callback) {
          assertAuth();
          return auth.$login('password', {
            email: email,
            password: pass,
            rememberMe: true
          }).then(function(user) {
            if( callback ) {
              //todobug https://github.com/firebase/angularFire/issues/199
              $timeout(function() {
                callback(null, user);

              });
              changeUser(user);
            }
            return user;
          }, callback);
        },

        logout: function() {
          assertAuth();
          auth.$logout();
          changeUser({
              username: '',
              role: userRoles.public
          });
        },

        createAccount: function(email, pass, name) {
          assertAuth();
          return auth.$createUser(email, pass)
            .then(function() {
              // authenticate so we have permission to write to Firebase
              return fns.login(email, pass);
            });
        },

        changePassword: function(opts) {
          assertAuth();
          var cb = opts.callback || function() {};
          if( !opts.oldpass || !opts.newpass ) {
            $timeout(function(){ cb('Please enter a password'); });
          }
          else if( opts.newpass !== opts.confirm ) {
            $timeout(function() { cb('Passwords do not match'); });
          }
          else {
            return auth.$changePassword(opts.email, opts.oldpass, opts.newpass).then(function() { cb && cb(null) }, cb);
          }
        },

        changeEmail: function(password, newEmail) {
          return changeEmail(password, fns.user.email, newEmail, this);
        },

        removeUser: function(email, pass) {
          assertAuth();
          return auth.$removeUser(email, pass);
        },

        watch: function(cb, $scope) {
          fns.getUser().then(function(user) {
            cb(user);
          });
          listeners.push(cb);
          var unbind = function() {
            var i = listeners.indexOf(cb);
            if( i > -1 ) { listeners.splice(i, 1); }
          };
          if( $scope ) {
            $scope.$on('$destroy', unbind);
          }
          return unbind;
        },
        accessLevels: accessLevels,
        userRoles: userRoles,
        user: currentUser
      };

      function assertAuth() {
        if( auth === null ) { throw new Error('Must call loginService.init() before using its methods'); }
      }

      $rootScope.$on('$firebaseSimpleLogin:login', statusChange);
      $rootScope.$on('$firebaseSimpleLogin:logout', statusChange);
      $rootScope.$on('$firebaseSimpleLogin:error', statusChange);
      statusChange();

      return fns;
  }]);
