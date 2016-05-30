/**
 * Created by anisur on 04/09/14.
 */
ppApp.config(function ($translateProvider) {
  $translateProvider.translations('de', {
    APP_HEADLINE:   'Unterstützung für pflegende Angehörige',
    NAV_HOME:       'Zur Startseite',
    NAV_ABOUT:      'Über uns',
    APP_PROTOCOL:   'Protokoll',
    APP_CANCEL:     'Abbrechen',
    APP_SAVE:       'Speichern',
    NAV_BACK:       'Zurück zur Übersicht',
	  APP_SAVE_CONTINUE: 'Speichern & weiter',
    APP_CATEGORIES: 'Kategorien',
    APP_TIMELINE:   'Verlauf',
    APP_ACTIVITIES: 'Aktivitäten',
    APP_DIFFICULTIES: 'Difficulties',
    APP_ACTIVITY:   'Aktivität',
    APP_TIMEFRAME:  'Zeitraum',
    APP_STOPWATCH:  'Stoppuhr',
    APP_MINUTES:    'Minuten',
    APP_MINUTE:     'Minute',
    APP_ADD_NOTE:   'Notiz hinzufügen',


    // springboard
    NAV_PROTOCOL:   'Protokoll',
    NAV_COMPETENCY: 'Alltagskompetenz',
    NAV_APPLIANCES: 'Hilfsmittel',
    NAV_MEDICATION: 'Medikamente',
    NAV_TIPPS:      'MDK Tipps',
    NAV_PRINTOUT:      'PDF Druck',
    NAV_MESSAGES:   'Nachrichten',
    NAV_TODOS:      'Aufgaben',
    NAV_LOGIN:      'Anmelden',
    NAV_ADMIN:      'Admin',
    NAV_REWARD:     'Reward',
    NAV_REGISTER:   'Registrieren',


    //Competency
    COMPETENCY_INIT_QUESTION: 'Liegt eine Einschränkung der Alltagskompetenz vor?',
    COMPETENCY_INIT_BUTTON_DEFINITELY_NOT: 'Sicher nicht',
    COMPETENCY_INIT_BUTTON_EVENTUALLY_YES: 'Eventuell ja',
	  COMPETENCY_QUESTIONNAIRE: 'Fragebogen zur Alltagskompetenz',
    frequently: 'Häufig',
    never: 'Nie',
    occasionally: 'Mehrmals',
    seldom: 'Selten',
    COMPETENCY_QUESTION_UPDATE: 'Antwort speichern',
    COMPETENCY_QUESTIONNAIRE_CANCEL: 'Fragebogen verlassen',
    //Login
    LOGIN_LOGIN: 'Jetzt anmelden',
    LOGIN_REGISTER: 'Neu registrieren',
    LOGIN_CREATE_ACCOUNT: 'Zugang erstellen',

    //Medication
    MEDICATION_INIT_BUTTON_NOT_REQUIRED: 'Es werden keine Medikamente eingenommen',
    MEDICATION_INIT_BUTTON_LIST: 'Medikamantenliste',
    MEDICATION_INIT_BUTTON_CREATE: 'Neuer Eintrag',
    MEDICATION_LIST: 'Medication List',
    MEDICATION_ADD_EDIT: 'Medication Create/Update',
    MEDICATION_APP_TABLET: 'Tablet',
    MEDICATION_APP_SYRUP: 'Syrup',
    MEDICATION_APP_CREAM: 'Cream',
    MEDICATION_APP_SUBCUT_INJ: 'Subcutaneous Injection',
    MEDICATION_APP_INTRAMUS_INJ: 'Intramuscular Injection',
    MEDICATION_APP_INTRAVEN_INJ: 'Intravenous Injection',
    MEDICATION_APP_SUPPOSITORY: 'Suppository',
    MEDICATION_APP_OTHER: 'Other',
    MEDICATION_INCHR_RECIPIENT: 'Care recipient',
    MEDICATION_INCHR_GIVER: 'Care giver',
    MEDICATION_INCHR_NURSE: 'Nurse',
    MEDICATION_INCHR_OTHER: 'Other',
    MEDICATION_HELP_NO: 'No support',
    MEDICATION_HELP_SUPPORT: 'Support',
    MEDICATION_HELP_PARTIAL: 'Partial',
    MEDICATION_HELP_FULL: 'Full',
    MEDICATION_HELP_OVERSEE: 'Oversee',
    MEDICATION_HELP_COACH: 'Coach',
    MEDICATION_ERR_TITLE: 'Please enter title',
    MEDICATION_ERR_AMOUNT: 'Please select dosage time',
    MEDICATION_ERR_APPL: 'Please select application type',
    MEDICATION_ERR_PRESCRIPTION: 'Please select prescription in-charge',
    MEDICATION_ERR_DOSAGE: 'Please select dosage in-charge',
    MEDICATION_ERR_TAKING: 'Please select taking in-charge',
    MEDICATION_ERR_HELP: 'Please select help type',
    //Care
    CARE_CREATE: 'Eintrag hinzufügen',
    CARE_MORNING: 'Morgen',
    CARE_MIDDAY: 'Mittag',
    CARE_EVENING: 'Abend',
    CARE_NIGHT: 'Nacht',
    CARE_MINUTES_SPENT: 'Minuten',
    CARE_CAT_BODY: 'Körperpflege',
    CARE_CAT_HOUSEHOLD: 'Haushalt',
    CARE_CAT_MOBILITY: 'Mobilität',
    CARE_CAT_NUTRITION: 'Ernährung',

    CARE_TYPE_SUPPORT: 'Unterstützung',
    CARE_TYPE_PARTIAL: 'Teilweise Übernahme',
    CARE_TYPE_FULL: 'Vollständige Übernahme',
    CARE_TYPE_OVERSEE: 'Beaufsichtigung',
    CARE_TYPE_COACH: 'Anleitung',

    ADD_PICTURE: 'Bild hinzufügen',
    DELETE_ENTRY : 'Eintrag löschen',

    ACCOUNT_FAMILY_UPDATE: 'Update Family',
    DIFFICULTIES_ERR_SELECT: 'Select Difficulty'
     //Tipp
  });

  // @todo better translations before using US version
  $translateProvider.translations('en', {
    APP_HEADLINE:   'Help for Caregivers',
    NAV_HOME:       'Home',
    NAV_ABOUT:      'About',
    APP_PROTOCOL:   'Protocol',
    APP_CANCEL:     'Cancel',
    APP_SAVE:       'Save',
	  NAV_BACK:       'Back to overview',
    APP_SAVE_CONTINUE:  'Save & Continue',
    APP_CATEGORIES: 'Categories',
    APP_TIMELINE:   'Timeline',
    APP_ACTIVITIES: 'Activities',
    APP_ACTIVITY:   'Activity',
    APP_TIMEFRAME:  'Timeframe',
    APP_STOPWATCH:  'Stoppwatch',
    APP_MINUTES:    'minutes',
    APP_MINUTE:     'minute',
    APP_ADD_NOTE:   'Add note',

    // springboard
    NAV_PROTOCOL:   'Protocol',
    NAV_COMPETENCY: 'Life competency',
    NAV_APPLIANCES: 'Therapeutic Appliances',
    NAV_MEDICATION: 'Prescribed medicine',
    NAV_TIPPS:      'Tipp for today',
    NAV_PRINTOUT:      'PDF printout',
    NAV_MESSAGES:   'Messages',
    NAV_TODOS:      'Todos',
    NAV_LOGIN:      'Login',
    NAV_ADMIN:      'Admin',
    NAV_REWARD:     'Reward',
    NAV_REGISTER:   'Register',

    COMPETENCY_INIT_QUESTION: 'Is there any reduction of everydaylife competencies?',
    COMPETENCY_INIT_BUTTON_DEFINITELY_NOT: 'Definitely not',
    COMPETENCY_INIT_BUTTON_EVENTUALLY_YES: 'Eventually yes',
	  COMPETENCY_QUESTIONNAIRE: 'Competency Questionnaire',
	  //Competency
    frequently: 'Frequently',
    never: 'Never',
    occasionally: 'Occasionally',
    seldom: 'Seldom',
    COMPETENCY_QUESTION_UPDATE: 'Save answer',
    COMPETENCY_QUESTIONNAIRE_CANCEL: 'Cancel questionnaire',
    //Login
    LOGIN_LOGIN: 'Login',
    LOGIN_REGISTER: 'Register',
    LOGIN_CREATE_ACCOUNT: 'Create new account',
     //Medication
    MEDICATION_INIT_BUTTON_NOT_REQUIRED: 'No Medication Required',
    MEDICATION_INIT_BUTTON_LIST: 'Medication List',
    MEDICATION_INIT_BUTTON_CREATE: 'Add Medication',
    MEDICATION_LIST: 'Medication List',
    MEDICATION_ADD_EDIT: 'Medication Create/Update',
    MEDICATION_APP_TABLET: 'Tablet',
    MEDICATION_APP_SYRUP: 'Syrup',
    MEDICATION_APP_CREAM: 'Cream',
    MEDICATION_APP_SUBCUT_INJ: 'Subcutaneous Injection',
    MEDICATION_APP_INTRAMUS_INJ: 'Intramuscular Injection',
    MEDICATION_APP_INTRAVEN_INJ: 'Intravenous Injection',
    MEDICATION_APP_SUPPOSITORY: 'Suppository',
    MEDICATION_APP_OTHER: 'Other',
    MEDICATION_INCHR_RECIPIENT: 'Care recipient',
    MEDICATION_INCHR_GIVER: 'Care giver',
    MEDICATION_INCHR_NURSE: 'Nurse',
    MEDICATION_INCHR_OTHER: 'Other',
    MEDICATION_HELP_NO: 'No support',
    MEDICATION_HELP_SUPPORT: 'Support',
    MEDICATION_HELP_PARTIAL: 'Partial',
    MEDICATION_HELP_FULL: 'Full',
    MEDICATION_HELP_OVERSEE: 'Oversee',
    MEDICATION_HELP_COACH: 'Coach',
    MEDICATION_ERR_TITLE: 'Please enter title',
    MEDICATION_ERR_AMOUNT: 'Please select dosage time',
    MEDICATION_ERR_APPL: 'Please select application type',
    MEDICATION_ERR_PRESCRIPTION: 'Please select prescription in-charge',
    MEDICATION_ERR_DOSAGE: 'Please select dosage in-charge',
    MEDICATION_ERR_TAKING: 'Please select taking in-charge',
    MEDICATION_ERR_HELP: 'Please select help type',
    //CARE
    CARE_CREATE: 'Add New',
    CARE_MORNING: 'Morning',
    CARE_MIDDAY: 'Midday',
    CARE_EVENING: 'Evening',
    CARE_NIGHT: 'Night',
    CARE_MINUTES_SPENT: 'Minutes spent',
    CARE_CAT_BODY: 'Body',
    CARE_CAT_HOUSEHOLD: 'Household',
    CARE_CAT_MOBILITY: 'Mobility',
    CARE_CAT_NUTRITION: 'Nutrition',

    CARE_TYPE_SUPPORT: 'Support',
    CARE_TYPE_PARTIAL: 'Partial',
    CARE_TYPE_FULL: 'Full',
    CARE_TYPE_OVERSEE: 'Oversee',
    CARE_TYPE_COACH: 'Coach',

    ADD_PICTURE: 'Add picture',

    DELETE_ENTRY : 'Delete entry',

    ACCOUNT_FAMILY_UPDATE: 'Update Family',
    DIFFICULTIES_ERR_SELECT: 'Select Difficulty',
    APP_DIFFICULTIES: 'Difficulties'
    //Tipp
  });

  $translateProvider.preferredLanguage('de');
  $translateProvider.useCookieStorage();

})

  .provider('pickadateI18n', function() {
    var defaults = {
      'prev': 'prev',
      'next': 'next'
    };

    this.translations = {};

    this.$get = function() {
      var translations = this.translations;

      return {
        t: function(key) {
          return translations[key] || defaults[key];
        }
      }
    }
  })
;