'use strict';

// Declare app level module which depends on filters, and services
angular.module('ppApp.config', [])

  // version of this app
  .constant('version', '0.1')

  // where to redirect users if they need to authenticate (see module.routeSecurity)
  .constant('loginRedirectPath', '/login')

  // DEMO Firebase URL is used here for development
  .constant('FBURL', 'https://shining-fire-8483.firebaseio.com')

  // ppPrintout App server
  .constant('ppPrintoutAppURL', 'http://localhost:4999')

//you can use this one to try out a demo of the seed
//   .constant('FBURL', 'https://angularfire-seed.firebaseio.com');


  // Number of competency questions, used for checking if questionnaire is complete
  // @todo refactor to have logic based on firebase data counting elements in array for question node
  .constant('COMPETENCY_QUESTION_COUNT', 13)

  .constant('PRIORITY_TIMESTAMP', 10000000000000)

  .constant('CARE_COMPLETE_COUNT', 7)

  //AngularJS date picker
  .constant('dateTimePickerConfig', {
      dropdownSelector: null,
      minuteStep: 5,
      minView: 'minute',
      startView: 'day',
      weekStart: 0
    })

  // app section init/config

  .constant('sectionsConfig', [
    {
      key: "care",
      context: {
        printout: true
      },
      enabled: true
    },
    {
      key: "competency",
      context: {
        printout: true
      },
      enabled: true
    },
    {
      key: "medication",
      context: {
        printout: true
      },
      enabled: true
    },
    {
      key: "printout",
      context: {
        printout: false
      },
      milestones: {
        printreqesttoprint: {
          title: "Requesting to print out a protocol",
          description: "A first time request for a printout for a family's care-giver",
          ".priority": 1.0
        },
        printreqesttoprint5x: {
          title: "Requesting to print out a protocol 5 times",
          description: "The 5th request for a printout for a family's care-giver" ,
          ".priority": 2.0
        }
      },
      enabled: true
    },
    {
      key: "tip",
      context: {
        printout: false
      },
      enabled: true
    },
    {
      key: "appliances",
      context: {
        printout: false
      },
      enabled: false
    }
  ])

  // Gamification config
  .constant('gamificationConfig', [
    {
      "bike" : {
        ".priority" : 5.0,
        "filename" : "bike.svg"
      },
      "flowerathouse" : {
        ".priority" : 3.0,
        "filename" : "flowerathouse.svg"
      },
      "hedge" : {
        ".priority" : 4.0,
        "filename" : "hedge.svg"
      },
      "terrace" : {
        ".priority" : 7.0,
        "filename" : "terrace.svg"
      },
      "way" : {
        ".priority" : 2.0,
        "filename" : "way.svg"
      },
      "wayflower" : {
        ".priority" : 6.0,
        "filename" : "wayflower.svg"
      },
      "windowdecoration" : {
        ".priority" : 1.0,
        "filename" : "windowdecoration.svg"
      },
      "firstfloor" : {
        ".priority" : 8.0,
        "filename" : "firstfloor.svg"
      },
      "flowerbox" : {
        ".priority" : 9.0,
        "filename" : "flowerbox.svg"
      },
      "wateringcan" : {
        ".priority" : 10.0,
        "filename" : "wateringcan.svg"
      },
      "shingle" : {
        ".priority" : 11.0,
        "filename" : "shingle.svg"
      },
      "mailbox" : {
        ".priority" : 12.0,
        "filename" : "mailbox.svg"
      },
      "windmill" : {
        ".priority" : 13.0,
        "filename" : "windmill.svg"
      },
      "stucco" : {
        ".priority" : 14.0,
        "filename" : "stucco.svg"
      },
      "shinglecoloured" : {
        ".priority" : 15.0,
        "filename" : "shinglecoloured.svg"
      },
      "bank" : {
        ".priority" : 16.0,
        "filename" : "bank.svg"
      },
      "pillow" : {
        ".priority" : 17.0,
        "filename" : "pillow.svg"
      },
      "tree" : {
        ".priority" : 18.0,
        "filename" : "tree.svg"
      },
      "grill" : {
        ".priority" : 19.0,
        "filename" : "grill.svg"
      },
      "butterfly" : {
        ".priority" : 20.0,
        "filename" : "butterfly.svg"
      },
      "chimney" : {
        ".priority" : 21.0,
        "filename" : "chimney.svg"
      },
      "shade" : {
        ".priority" : 22.0,
        "filename" : "shade.svg"
      },
      "rockingchair" : {
        ".priority" : 23.0,
        "filename" : "rockingchair.svg"
      }
    }

  ])

;

/*********************
 * !!FOR E2E TESTING!!
 *
 * Must enable email/password logins and manually create
 * the test user before the e2e tests will pass
 *
 * user: test@test.com
 * pass: test123
 */

