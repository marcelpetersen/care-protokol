'use strict';

angular
	.module('ppApp.service.sections', [
		
	])
	.factory('sectionConfigService', ['sectionsConfig', '_', function(sectionsConfig, _) {

		return {
			getAppSections: function (context) {
				context = _.isString(context) ? context : '' ;
				var sectionsConfigClone = _.extend({}, sectionsConfig);
				return _.filter(sectionsConfigClone, function(section) {
					if(context.length > 0) {
						return section.context[context] && section.enabled;
					} else {
						return section.enabled;
					} 
				});
			},

			getAppSectionMilestone: function (sectionName) {
				sectionName = _.isString(sectionName) ? sectionName : '' ;
				var self = this;
				var enabledAppSections = self.getAppSections();
				var sectionColl = _.filter(enabledAppSections, function(section) {
					return sectionName.length > 0 && 
						section.key == sectionName &&
						section.hasOwnProperty('milestones');
				});
				if(sectionColl.length == 1) {
					return sectionColl[0].milestones;
				}
			}
		}

	}]);