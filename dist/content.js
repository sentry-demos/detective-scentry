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

// Additional data for pages where Sentry was sniffed
localStorage.usesSentryPerformance = usesSentryPerformance();
localStorage.sentryPerformanceSampleRate  = sentryPerformanceSampleRate();
localStorage.sentryErrorSampleRate = sentryErrorSampleRate();
localStorage.dsnHost = dsnHost();
localStorage.projectId = projectId();
localStorage.sdkVersion = getSdkVersion();

function usesSentryPerformance() {
	if (typeof __SENTRY__ != 'undefined') {
		let options = __SENTRY__.hub.getClient().getOptions()
		return !!options.tracesSampleRate || !!options.tracesSampler
	}

	// The logic here is that performance did not exist in older SDKs (that used Raven instead
	// of __SENTRY__). So, if __SENTRY__ is undefined, then we can assume the page doesn't use
	// performance and return false.
	// SDKs with performance available should have __SENTRY__ defined.
	return false
}

function sentryPerformanceSampleRate() {
	if (usesSentryPerformance()) {
		let options = __SENTRY__.hub.getClient().getOptions()
		return options.tracesSampleRate * 100 // convert into a human-readable percentage
	}

	return null
}

function sentryErrorSampleRate() {
	// assume we care only about more recent SDKs
	if (typeof __SENTRY__ != 'undefined') {
		sentryConfig = __SENTRY__.hub.getClient().getOptions()
		sampleRate = sentryConfig.sampleRate ? sentryConfig.sampleRate : 1
		return sampleRate * 100 // convert into a human-readable percentage
	}

	return null
}

function dsnHost() {
	dsn = getDsn()
	if (dsn) {
		host = dsn.split("@")[1].split("/")[0] // i.e. o1.ingest.sentry.io
		return host
	}

	return null
}

function projectId() {
	dsn = getDsn()
	if (dsn) {
		splitDsn = dsn.split("/") // ['https:', '', 'lsdkfjlkjsdfk@o1.ingest.sentry.io', '1111']
		projectId = splitDsn[splitDsn.length - 1] // project id is the last element in the split DSN
		return projectId
	}

	return null
}

function getDsn() {
	if (typeof __SENTRY__ != 'undefined') {
		let options = __SENTRY__.hub.getClient().getOptions()
		return options.dsn
	}
}

function getSdkVersion() {
	if (typeof __SENTRY__ != 'undefined') {
		let options = __SENTRY__.hub.getClient().getOptions()
		return options._metadata ? options._metadata.sdk.version : '<unable to determine>'
	}
}
