chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "runDetection") {
    console.log("detecting SDKs...!");
    const detectionResults = detectAllSDKs();
    chrome.runtime.sendMessage({
      action: "detectionResults",
      data: detectionResults,
    });
  }
});

function detectAllSDKs() {
  const options = getOptions();

  return {
    hasSentry: !!window.Sentry || !!window.__SENTRY__ || !!window.Raven,
    hasNewRelic: !!window.newrelic,
    hasBugsnag: !!window.Bugsnag || !!window.bugsnag || !!window.bugsnagClient,
    hasRollbar: !!window._rollbarDidLoad,
    hasDatadog: !!window.DD_RUM,
    hasDatadogLogs: !!window.DD_LOGS,
    hasLogRocket: !!window._lr_loaded,
    hasAppDynamics: !!window.ADRUM,
    hasSessionStack: !!window.SessionStack,
    hasFullStory: !!(window.FS && window.FS.getCurrentSessionURL()),

    sentryLocation: !!window.Sentry ? window.location.href : "",
    newrelicLocation: !!window.newrelic ? window.location.href : "",
    bugsnagLocation: !!window.Bugsnag ? window.location.href : "",
    rollbarLocation: !!window._rollbarDidLoad ? window.location.href : "",
    datadogLocation: !!window.DD_RUM ? window.location.href : "",
    datadogLogsLocation: !!window.DD_LOGS ? window.location.href : "",
    logrocketLocation: !!window._lr_loaded ? window.location.href : "",
    appDynamicsLocation: !!window.ADRUM ? window.location.href : "",
    fullStoryLocation: !!(window.FS && window.FS.getCurrentSessionURL())
      ? window.location.href
      : "",

    usesSentryPerformance: usesSentryPerformance(),
    sentryPerformanceSampleRate: sentryPerformanceSampleRate(),
    sentryErrorSampleRate: sentryErrorSampleRate(),
    dsnHost: dsnHost(),
    projectId: projectId(),
    sdkVersion: getSdkVersion(),
  };

  // Define any helper functions like usesSentryPerformance, sentryPerformanceSampleRate, etc.

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
}
