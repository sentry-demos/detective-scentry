console.log("location: " + window.location.href)
if(!!window.Sentry || !!window.__SENTRY__ || !!window.Raven) {
	console.log("     -> detected sentry at the above location (" + window.location.href + ")")
}
localStorage.hasSentry = !!window.Sentry || !!window.__SENTRY__ || !!window.Raven;
localStorage.hasNewRelic = !!window.newrelic;
localStorage.hasBugsnag = !!window.Bugsnag || !!window.bugsnag || !!window.bugsnagClient;
localStorage.hasRollbar = !!window._rollbarDidLoad;
localStorage.hasDatadog = !!window.DD_RUM;
localStorage.hasLogRocket = !!window._lr_loaded;

localStorage.sentryLocation = localStorage.hasSentry ? window.location.href : ''
localStorage.newrelicLocation = localStorage.hasNewRelic ? window.location.href : ''
localStorage.bugsnagLocation = localStorage.hasBugsnag ? window.location.href : ''
localStorage.rollbarLocation = localStorage.hasRollbar ? window.location.href : ''
localStorage.datadogLocation = localStorage.hasDatadog ? window.location.href : ''
localStorage.logrocketLocation = localStorage.hasLogRocket ? window.location.href : ''

