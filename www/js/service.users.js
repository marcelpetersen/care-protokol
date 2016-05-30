'use strict';

angular
	.module('ppApp.service.users', [
		'firebase'
	])
	.factory('usersService', ['$firebase', 'firebaseSync', '$q', '$timeout', 'loginService', 'familiesService', '_', function($firebase, firebaseSync, $q, $timeout, loginService, familiesService, _) {

		function firstPartOfEmail(email) {
	        return ucfirst(email.substr(0, email.indexOf('@'))||'');
	    }

	    function ucfirst (str) {
	        // credits: http://kevin.vanzonneveld.net
	        str += '';
	        var f = str.charAt(0).toUpperCase();
	        return f + str.substr(1);
	     }

	    function sanitizeForUUID (eMailString) {
	        var unwanted = new RegExp("[.*+?|()\\.\\[\\]{}\\\\]", "g");
	        return firstPartOfEmail(eMailString + '').replace(unwanted, '').replace(/\s+/g, '').replace(/\'+/g, '').replace(/-+/g, '').toLowerCase();
	    }

	    return {

      getNameOfUser: function(simpleLoginUser) {
        return firstPartOfEmail(simpleLoginUser.email);
      },

			getAllAppUsers: function() {
				return $firebase(firebaseSync.ref('users'));
			},

			appUserExists: function(userNodeUUID) {
				return firebaseSync.keyExists('users/' + userNodeUUID);
			},
      userFamilyExists: function(userNodeUUID){
        return firebaseSync.keyExists('users/' + userNodeUUID + '/families');
      },

			addFamilyNode: function(userNodeUUID) {
        return firebaseSync.syncArray('users/' + userNodeUUID + '/families').$add({name: 'Some name'});
			},

			createProfileOfSLoginUser: function(simpleLoginUser) {
				// Create profile of a logged-in user w/ provider 'password'
				// i.e. Simple Login provider
			      var ref = firebaseSync.ref('users', simpleLoginUser.uid), def = $q.defer();
			      ref.set({email: simpleLoginUser.email, name: simpleLoginUser.name||firstPartOfEmail(simpleLoginUser.email), role: 'user'}, function(err) {
			        $timeout(function() {
			          if( err ) {
			            def.reject(err);
			          }
			          else {
			            def.resolve(ref);
			          }
			        })
			  	});
			    return def.promise;
			},

      setFamily: function (simpleLoginUser, familyObj) {
        firebaseSync.keyExists("users/" + simpleLoginUser.uid + "/families/" + familyObj.$id).then(function(path){
          if(path === null) {
            //add this familyObj
            firebaseSync.syncData("users/" + simpleLoginUser.uid + "/families").$set(familyObj.$id, {name: familyObj.name});
            //add this user to the family
            familiesService.setUser(familyObj.$id, simpleLoginUser);
          }
          //set it to the current node
          firebaseSync.syncData("users/" + simpleLoginUser.uid).$set('family',familyObj.$id);
        });
      },

      getFamily: function(simpleLoginUser) {
          return firebaseSync.syncObject("users/" + simpleLoginUser.uid + "/family").$loaded();
      },

      getAllFamilies: function(simpleLoginUser) {
        return firebaseSync.syncArray("users/" + simpleLoginUser.uid + "/families").$loaded();
      },

      getFamilyForCurrentUser: function() {
          var self = this;
          var def = $q.defer();
          return loginService.getUser().then(function(currentLoggedInUser){
            if(currentLoggedInUser !== null) {
              def.resolve(self.getFamily(currentLoggedInUser));
            } else {
              // TODO: defined app error states... based on which one
              // might choose routes
              def.reject(new Error('No logged in user'));
            }
            return def.promise;
          },
          function(error){
            def.reject(error);
            return def.promise;
          });
        }
		};

	}]);