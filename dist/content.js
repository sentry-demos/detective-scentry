console.log("Detecting SDKs...");

localStorage.hasSentry =
  !!window.Sentry || !!window.__SENTRY__ || !!window.Raven;
localStorage.hasNewRelic = !!window.newrelic;
localStorage.hasBugsnag =
  !!window.Bugsnag || !!window.bugsnag || !!window.bugsnagClient;
localStorage.hasRollbar = !!window._rollbarDidLoad;
localStorage.hasDatadog = !!window.DD_RUM;
localStorage.hasDatadogLogs = !!window.DD_LOGS;
localStorage.hasLogRocket = !!window._lr_loaded;
localStorage.hasAppDynamics = !!window.ADRUM;
localStorage.hasSessionStack = !!window.SessionStack;
localStorage.hasFullStory = !!(window.FS && window.FS.getCurrentSessionURL());

localStorage.sentryLocation = localStorage.hasSentry
  ? window.location.href
  : "";
localStorage.newrelicLocation = localStorage.hasNewRelic
  ? window.location.href
  : "";
localStorage.bugsnagLocation = localStorage.hasBugsnag
  ? window.location.href
  : "";
localStorage.rollbarLocation = localStorage.hasRollbar
  ? window.location.href
  : "";
localStorage.datadogLocation = localStorage.hasDatadog
  ? window.location.href
  : "";
localStorage.datadogLogsLocation = localStorage.hasDatadogLogs
  ? window.location.href
  : "";
localStorage.logrocketLocation = localStorage.hasLogRocket
  ? window.location.href
  : "";
localStorage.appDynamicsLocation = localStorage.hasAppDynamics
  ? window.location.href
  : "";
localStorage.fullStoryLocation = localStorage.hasFullStory
  ? window.location.href
  : "";

// Additional data for pages where Sentry was sniffed
let options = getOptions();
localStorage.usesSentryPerformance = usesSentryPerformance();
localStorage.sentryPerformanceSampleRate = sentryPerformanceSampleRate();
localStorage.sentryErrorSampleRate = sentryErrorSampleRate();
localStorage.dsnHost = dsnHost();
localStorage.projectId = projectId();
localStorage.sdkVersion = getSdkVersion();

function getOptions() {
  if (typeof __SENTRY__ != "undefined") {
    // check for v7 SDK
    let options = __SENTRY__.hub?.getClient()?.getOptions();
    if (typeof options != "undefined") {
      return options;
    }

    // check for v8 SDK
    options = __SENTRY__[__SENTRY__.version]?.defaultCurrentScope
      ?.getClient()
      ?.getOptions();
    if (typeof options != "undefined") {
      return options;
    }
  }

  // Assume that for detailed information,
  // we care only about more recent JS SDKs (v7+)
  return {};
}

function usesSentryPerformance() {
  if (typeof __SENTRY__ != "undefined") {
    return !!options.tracesSampleRate || !!options.tracesSampler;
  }

  // The logic here is that performance did not exist in older SDKs (that used Raven instead
  // of __SENTRY__). So, if __SENTRY__ is undefined, then we can assume the page doesn't use
  // performance and return false.
  // SDKs with performance available should have __SENTRY__ defined.
  return false;
}

function sentryPerformanceSampleRate() {
  if (usesSentryPerformance()) {
    return options?.tracesSampleRate * 100; // convert into a human-readable percentage
  }

  return null;
}

function sentryErrorSampleRate() {
  let errorSampleRate = "<unable to determine>";
  configuredRate = options?.sampleRate;
  errorSampleRate = !!configuredRate ? configuredRate * 100 : errorSampleRate;

  return errorSampleRate;
}

function dsnHost() {
  dsn = getDsn();
  if (dsn) {
    host = dsn.split("@")[1].split("/")[0]; // i.e. o1.ingest.sentry.io
    return host;
  }

  return null;
}

function projectId() {
  dsn = getDsn();
  if (dsn) {
    splitDsn = dsn.split("/"); // ['https:', '', 'lsdkfjlkjsdfk@o1.ingest.sentry.io', '1111']
    projectId = splitDsn[splitDsn.length - 1]; // project id is the last element in the split DSN
    return projectId;
  }

  return null;
}

function getDsn() {
  return options?.dsn;
}

function getSdkVersion() {
  return !!options?._metadata
    ? options._metadata.sdk.version
    : "<unable to determine>";
}
