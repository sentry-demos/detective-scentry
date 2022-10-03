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

// Metadata about Sentry Usage
localStorage.usesSentryPerformance = usesSentryPerformance();

function usesSentryPerformance() {
	if (__SENTRY__) {
		let options = __SENTRY__.hub.getClient().getOptions()
		return !!options.tracesSampleRate || !!options.tracesSampler
	}

	// The logic here is that performance did not exist in older SDKs (that used Raven instead
	// of __SENTRY__). So, if __SENTRY__ is undefined, then we can assume the page doesn't use
	// performance and return false.
	// SDKs with performance available should have __SENTRY__ defined.
	return false
}