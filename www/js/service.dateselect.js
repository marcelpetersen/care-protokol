'use strict';

angular
	.module('ppApp.service.dateselect', [
	])
	.factory('dateselectService', ['$rootScope', '$ionicPopup', 'amMoment', '$translate', function($rootScope, $ionicPopup, amMoment, $translate) {

		var _curDate = new Date();
		
		return {

			data : {
				date: _curDate,
				formatted: null
			},

			tmp : {
		    	newDate: _curDate
			},

			getSelectedDateObject : function() {
				var self = this;
				if (self.data.date._isAMomentObject) {
			        return self.data.date.toDate();
			     } else {
			        return self.data.date;
			     }
			},
			
		    nextDay : function(formatDateCB) {
	          var self = this;
		      var ndate = moment(self.data.date).add('d', 1);
		      self.tmp.newDate = ndate;
		      self.data.date = ndate;
		      self.formatDate(ndate, formatDateCB);
		    },

		    prevDay : function(formatDateCB) {
		      var self = this;
		      var pdate  = moment(self.data.date).subtract('d', 1);
		      self.tmp.newDate = pdate;
		      self.data.date = pdate;
		      self.formatDate(pdate, formatDateCB);
		    },

		    openDate : function(_scope, formatDateCB) {
		      var self = this;
		      var datePopup = $ionicPopup.show({
		           template: '<datetimepicker ng-model="tmp.newDate" datetimepicker-config="{ startView:\'day\', minView:\'day\' }"></datetimepicker>',
		           title: "Date",
		           scope: _scope,
		           buttons: [
		             { text: 'Cancel',
		               onTap: function(e) {
		                 self.tmp.newDate = self.data.date;
		                }
		             },
		             {
		               text: '<b>Save</b>',
		               type: 'button-positive',
		               onTap: function(e) {
		                 self.data.date = self.tmp.newDate;
		                 self.formatDate(self.tmp.newDate, formatDateCB);
		               }
		             }
		           ]
		       });
		    },

		    formatDate : function(unformatedDate, formatDateCB) {
		       var self = this;
		       amMoment.changeLanguage($translate.use() + '-notime');
		       var m = moment(unformatedDate);
	           if (m.isValid()){
	             self.data.formatted = m.calendar();
	           } else {
	             self.data.formatted = unformatedDate;
	           }
	           amMoment.changeLanguage($translate.use());
	           formatDateCB && formatDateCB(unformatedDate)
		    }

		};

}]);