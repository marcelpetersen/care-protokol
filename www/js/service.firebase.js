'use strict';

angular.module('ppApp.service.firebase', ['firebase'])
  // a simple utility to create $firebase objects from angularFire
  .factory('firebaseSync', ['$window', 'FBURL', '$firebase', '$q', '$log', function($window, FBURL, $firebase, $q, $log) {

      return {

        ref: firebaseRef,
        syncData: function(path) {
          return syncData.apply(null, arguments);
        },

        syncObject: function(path, factoryConfig) {
          var date = new Date();
          //$log.debug("syncObject: " + path + ' ' + date.getSeconds() + ':' + date.getMilliseconds());
          return syncData.apply(null, arguments).$asObject();
        },

        syncArray: function(path, factoryConfig) {
          var date = new Date();
          //$log.debug("syncArray: " + path + ' ' + date.getSeconds() + ':' + date.getMilliseconds());
          return syncData.apply(null, arguments).$asArray();
        },

        keyExists: function(path, factoryConfig) {
    			var retObj = this.syncObject(path, factoryConfig);
    			var def = $q.defer();
    			retObj.$loaded().then(function(obj){
    				if(obj.$value === null) {
    					//the url do not exist, hence return null
    					def.resolve(null);
    				} else {
    					//return the path
    					def.resolve(path);
    				}
    			});
    			return def.promise;
    		}

      };

      function pathRef(args) {
        for (var i = 0; i < args.length; i++) {
          if (angular.isArray(args[i])) {
            args[i] = pathRef(args[i]);
          }
          else if( typeof args[i] !== 'string' ) {
            throw new Error('Argument '+i+' to firebaseRef is not a string: '+args[i]);
          }
        }
        return args.join('/');
      }

      /**
       * Example:
       * <code>
       *    function(firebaseRef) {
         *       var ref = firebaseRef('path/to/data');
         *    }
       * </code>
       *
       * @function
       * @name firebaseRef
       * @param {String|Array...} path relative path to the root folder in Firebase instance
       * @return a Firebase instance
       */
      function firebaseRef(path) {
        var ref = new $window.Firebase(FBURL);
        var args = Array.prototype.slice.call(arguments);
        if( args.length ) {
          ref = ref.child(pathRef(args));
        }
        return ref;
      }

      /**
       * Create a $firebase reference with just a relative path. For example:
       *
       * <code>
       * function(syncData) {
         *    // a regular $firebase ref
         *    $scope.widget = syncData('widgets/alpha');
         *
         *    // or automatic 3-way binding
         *    syncData('widgets/alpha').$bind($scope, 'widget');
         * }
       * </code>
       *
       * Props is the second param passed into $firebase. It can also contain limit, startAt, endAt,
       * and they will be applied to the ref before passing into $firebase
       *
       * @function
       * @name syncData
       * @param {String|Array...} path relative path to the root folder in Firebase instance
       * @param {object} [props]
       * @return a Firebase instance
       */
      function syncData(path, props) {
        var ref = firebaseRef(path);
        props = angular.extend({}, props);
        angular.forEach(['limit', 'startAt', 'endAt'], function(k) {
          if( props.hasOwnProperty(k) ) {
            var v = props[k];
            ref = ref[k].apply(ref, angular.isArray(v)? v : [v]);
            delete props[k];
          }
        });
        return $firebase(ref, props);
      }
   }]);
