import "../styles/popup.css";
import "bootstrap/dist/css/bootstrap.min.css";

import * as React from "react";
import * as ReactDOM from "react-dom";

import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";

// Images are referenced from dist/images/.
//
// When adding new images, copy them manually into dist/images/.
// webpack doesn't automatically bundle them.
// Images are referenced from dist/images/.
//
// When adding new images, copy them manually into dist/images/.
// webpack doesn't automatically bundle them.
let randomPet;
const santoImg = "images/santo.jpg";
const santoChicken = "images/santochicken.jpg";
const santoLeaves = "images/santoleaves.jpg";
const santoFloor = "images/santofloor.jpg";
const nubbleLong = "images/nubble_long.jpeg";
const nubbleBox = "images/nubble_box.jpeg";
const nubbleHoliday = "images/nubble_holiday.jpeg";
const nubbleSwitch = "images/nubble_switch.jpeg";

const sentryLogo = chrome.runtime.getURL("images/sentry-logo.png");
const bugsnagLogo = chrome.runtime.getURL("images/bugsnag-logo.png");
const rollbarLogo = chrome.runtime.getURL("images/rollbar-logo.png");
const newrelicLogo = chrome.runtime.getURL("images/newrelic-logo.png");
const datadogLogo = chrome.runtime.getURL("images/datadog-logo.png");
const logrocketLogo = chrome.runtime.getURL("images/logrocket-logo.png");
const datadogLogsLogo = chrome.runtime.getURL("images/datadog-logs-logo.png");
const appDynamicsLogo = chrome.runtime.getURL("images/appdynamics-logo.png");
const fullStoryLogo = chrome.runtime.getURL("images/fullstory-logo.png");
const sessionStackLogo = chrome.runtime.getURL("images/sessionstack-logo.png");
const splunkLogo = chrome.runtime.getURL("images/splunk-logo.png");
const postHogLogo = chrome.runtime.getURL("images/posthog-logo.png");
const petImages = [
  santoImg,
  santoChicken,
  santoLeaves,
  santoFloor,
  nubbleBox,
  nubbleHoliday,
  nubbleLong,
  nubbleSwitch,
];

const ACCEPTABLE_SAMPLE_RATE = 50;

interface IProps {}

interface IState {
  hasSentry?: boolean;
  hasNewRelic?: boolean;
  hasBugsnag?: boolean;
  hasRollbar?: boolean;
  hasDatadog?: boolean;
  hasDatadogLogs?: boolean;
  hasLogRocket?: boolean;
  hasAppDynamics?: boolean;
  hasSessionStack?: boolean;
  hasFullStory?: boolean;
  hasSplunk?: boolean;
  hasPostHog?: boolean;
  sentryLocation: string;
  newrelicLocation: string;
  bugsnagLocation: string;
  rollbarLocation: string;
  datadogLocation: string;
  datadogLogsLocation: string;
  logrocketLocation: string;
  appDynamicsLocation: string;
  fullStoryLocation: string;
  sessionStackLocation: string;
  splunkLocation: string;
  postHogLocation: string;
  usesSentryPerformance?: boolean;
  sentryPerformanceSampleRate?: number;
  sentryErrorSampleRate?: number;
  sentryPerformanceSampler?: any | null;
  sentryPerformanceSessionReplaySampleRate?: number;
  sentryPerformanceSessionReplayOnErrorSampleRate?: number;
  dsnHost?: string;
  projectId?: string;
  sdkVersion?: string;
}

class Popup extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      hasSentry: false,
      hasNewRelic: false,
      hasBugsnag: false,
      hasRollbar: false,
      hasDatadog: false,
      hasDatadogLogs: false,
      hasLogRocket: false,
      hasAppDynamics: false,
      hasFullStory: false,
      hasSessionStack: false,
      hasSplunk: false,
      hasPostHog: false,
      sentryLocation: "",
      newrelicLocation: "",
      bugsnagLocation: "",
      rollbarLocation: "",
      datadogLocation: "",
      datadogLogsLocation: "",
      logrocketLocation: "",
      appDynamicsLocation: "",
      fullStoryLocation: "",
      sessionStackLocation: "",
      splunkLocation: "",
      postHogLocation: "",
      usesSentryPerformance: false,
      sentryPerformanceSampleRate: 0,
      sentryErrorSampleRate: 0,
      sentryPerformanceSessionReplaySampleRate: 0,
      sentryPerformanceSessionReplayOnErrorSampleRate: 0,
      dsnHost: "",
      projectId: "",
      sdkVersion: "",
    };
  }

  findInJSFiles(strToFind, successFunc) {
    let that = this;

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        let url = tabs[0].url;
        let hasBeenFound = false;

        debugger; // can i use 'this' here?
        that.executeScript(
          "Array.from(document.getElementsByTagName('script')).map((h) => h.outerHTML);",
          (results) => {
            let i = 0;
            while (i < results[0].length && !hasBeenFound) {
              const scriptString = results[0][i];
              if (
                scriptString.includes("src=") &&
                !scriptString.includes('src="chrome-extension://')
              ) {
                let srcRegEx = /src="(.*?)"/g,
                  source = srcRegEx.exec(scriptString),
                  scriptSrc = source[1];

                if (!scriptSrc.includes("http")) {
                  scriptSrc = url.slice(0, -1) + scriptSrc;
                }
                fetch(scriptSrc)
                  .then((response) => response.text())
                  .then((text) => {
                    if (text.includes(strToFind)) {
                      hasBeenFound = true;
                      successFunc();
                    }
                  })
                  .catch((error) => console.log(error));
              }
              i++;
            }
          }
        );
      }
    );
  }

  executeScript(func, successFunc) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      // @ts-ignore
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: func,
        },
        (results) => {
          if (results && results.length > 0 && results[0].result) {
            successFunc(results[0].result);
          }
        }
      );
    });
  }

  randomPetImage() {
    const randomIndex = Math.floor(Math.random() * petImages.length);
    randomPet = petImages[randomIndex];
    return chrome.runtime.getURL(randomPet);
  }

  componentDidMount() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      // Inject `inject.js` on popup open
      // @ts-ignore
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ["inject.js"],
        },
        () => {
          console.log("Detecting SDKs...");

          // Retrieve detection results after `inject.js` runs
          this.executeScript(
            () => localStorage.hasSentry,
            (result) => this.setState({ hasSentry: result === "true" })
          );

          this.executeScript(
            () => localStorage.hasNewRelic,
            (result) => this.setState({ hasNewRelic: result === "true" })
          );

          this.executeScript(
            () => localStorage.hasBugsnag,
            (result) => this.setState({ hasBugsnag: result === "true" })
          );

          this.executeScript(
            () => localStorage.hasRollbar,
            (result) => this.setState({ hasRollbar: result === "true" })
          );

          this.executeScript(
            () => localStorage.hasDatadog,
            (result) => this.setState({ hasDatadog: result === "true" })
          );

          this.executeScript(
            () => localStorage.hasDatadogLogs,
            (result) => this.setState({ hasDatadogLogs: result === "true" })
          );

          this.executeScript(
            () => localStorage.hasLogRocket,
            (result) => this.setState({ hasLogRocket: result === "true" })
          );

          this.executeScript(
            () => localStorage.hasAppDynamics,
            (result) => this.setState({ hasAppDynamics: result === "true" })
          );

          this.executeScript(
            () => localStorage.hasFullStory,
            (result) => this.setState({ hasFullStory: result === "true" })
          );

          this.executeScript(
            () => localStorage.hasSessionStack,
            (result) => this.setState({ hasSessionStack: result === "true" })
          );

          // Retrieve location data from localStorage
          this.executeScript(
            () => localStorage.sentryLocation,
            (result) => this.setState({ sentryLocation: result })
          );

          this.executeScript(
            () => localStorage.newrelicLocation,
            (result) => this.setState({ newrelicLocation: result })
          );

          this.executeScript(
            () => localStorage.bugsnagLocation,
            (result) => this.setState({ bugsnagLocation: result })
          );

          this.executeScript(
            () => localStorage.rollbarLocation,
            (result) => this.setState({ rollbarLocation: result })
          );

          this.executeScript(
            () => localStorage.datadogLocation,
            (result) => this.setState({ datadogLocation: result })
          );

          this.executeScript(
            () => localStorage.datadogLogsLocation,
            (result) => this.setState({ datadogLogsLocation: result })
          );

          this.executeScript(
            () => localStorage.logrocketLocation,
            (result) => this.setState({ logrocketLocation: result })
          );

          this.executeScript(
            () => localStorage.appDynamicsLocation,
            (result) => this.setState({ appDynamicsLocation: result })
          );

          this.executeScript(
            () => localStorage.fullStoryLocation,
            (result) => this.setState({ fullStoryLocation: result })
          );

          this.executeScript(
            () => localStorage.sessionStackLocation,
            (result) => this.setState({ sessionStackLocation: result })
          );

          // Check for Sentry-specific values
          this.executeScript(
            () => localStorage.usesSentryPerformance,
            (result) =>
              this.setState({ usesSentryPerformance: result === "true" })
          );

          this.executeScript(
            () => localStorage.sentryPerformanceSampleRate,
            (result) => this.setState({ sentryPerformanceSampleRate: result })
          );

          this.executeScript(
            () => localStorage.sentryErrorSampleRate,
            (result) => this.setState({ sentryErrorSampleRate: result })
          );

          this.executeScript(
            () => localStorage.sentryPerformanceSessionReplaySampleRate,
            (result) => this.setState({ sentryPerformanceSessionReplaySampleRate: result })
          );

          this.executeScript(
            () => localStorage.sentryPerformanceSampler,
            (result) => this.setState({ sentryPerformanceSampler: result  })
          );

          this.executeScript(
            () => localStorage.sentryPerformanceSessionReplayOnErrorSampleRate,
            (result) => this.setState({ sentryPerformanceSessionReplayOnErrorSampleRate: result })
          );

          this.executeScript(
            () => localStorage.dsnHost,
            (result) => this.setState({ dsnHost: result })
          );

          this.executeScript(
            () => localStorage.projectId,
            (result) => this.setState({ projectId: result })
          );

          this.executeScript(
            () => localStorage.sdkVersion,
            (result) => this.setState({ sdkVersion: result })
          );

          this.executeScript(
            () => localStorage.hasSplunk,
            (result) => this.setState({ hasSplunk: result === "true" })
          );

          this.executeScript(
            () => localStorage.hasPostHog,
            (result) => this.setState({ hasPostHog: result === "true" })
          );

          this.executeScript(
            () => localStorage.splunkLocation,
            (result) => this.setState({ splunkLocation: result })
          );

          this.executeScript(
            () => localStorage.postHogLocation,
            (result) => this.setState({ postHogLocation: result })
          );
        }
      );
    });
  }

  render() {
    return (
      <div className="popup-padded">
        <Card.Header>Detective Scentry here!</Card.Header>
        <Card.Body>
          <Card.Img src={this.randomPetImage()} />
          {/* <Card.Title>Detective Scentry Here!</Card.Title> */}
          <Card.Subtitle className="mb-2 text-muted">
            {randomPet.includes("santo") &&
              "Woof! My name is Santo and I detect SDKs."}
            {randomPet.includes("nubble") &&
              "Meow! My name is Nubble and I detect SDKs."}
          </Card.Subtitle>
          <p className="lead tooltip">...I have begun sniffing for SDKs...</p>
          <Card.Text>I smelled me some:</Card.Text>
          <ListGroup variant="flush">
            {this.state.hasSentry ? (
              <ListGroup.Item>
                <img className="sentry-logo" src={sentryLogo} />
                <ul>
                  <li>
                    {this.state.usesSentryPerformance ? (
                      <span className="location">
                        {!isNaN(this.state.sentryPerformanceSampleRate) && (
                          <>
                            <span> Using Sentry performance</span> <br />
                          </>
                        )}
                        <span
                          className={
                            isNaN(this.state.sentryPerformanceSampleRate)
                              ? ""
                              : this.state.sentryPerformanceSampleRate <
                                ACCEPTABLE_SAMPLE_RATE
                              ? "warning"
                              : "success"
                          }
                        >
                          {isNaN(this.state.sentryPerformanceSampleRate) ? (
                            <>
                            <span className="code-line">tracesSampler</span> {this.state.sentryPerformanceSampler ? <span className="success">is set</span> : <span className="warning">is not set</span>}
                            <div className="warning-container">
                              <span>Paste following command into console to retrieve manually: </span>
                              <div className="code-block-container">
                                <button 
                                  className="copy-button"
                                  onClick={() => {
                                    const code = `__SENTRY__[__SENTRY__.version]?.defaultCurrentScope?.getClient()?.getOptions() || __SENTRY__.hub._stack[0].client._options.tracesSampler ;`;
                                    navigator.clipboard.writeText(code);
                                    const button = document.querySelector('.copy-button');
                                    if (button) {
                                      button.textContent = 'Copied!';
                                      setTimeout(() => {
                                        button.textContent = 'Copy';
                                      }, 2000);
                                    }
                                  }}
                                >
                                  Copy
                                </button>
                                <pre className="code-block">
                                  {`__SENTRY__[__SENTRY__.version]?.defaultCurrentScope?.getClient()?.getOptions()?.tracesSampler || __SENTRY__.hub._stack[0].client._options.tracesSampler ;`}
                                </pre>
                                <span>Reach out to your SE for futher assistance.</span>
                              </div>
                            </div>
                            </>
                          ) : (
                            `Transaction Sampling: ${this.state.sentryPerformanceSampleRate}% (client-side)`
                          )}
                        </span>
                      </span>
                    ) : (
                      <span className="location warning">
                        Does not use Sentry performance!
                      </span>
                    )}
                  </li>
                  <li>
                    <span className="location">
                      {this.state.sentryErrorSampleRate ? (
                        <span
                          className={
                            this.state.sentryErrorSampleRate <
                            ACCEPTABLE_SAMPLE_RATE
                              ? "warning"
                              : ""
                          }
                        >
                          Error Sampling: {this.state.sentryErrorSampleRate}%
                          (client-side)
                        </span>
                      ) : (
                        <span className="warning">
                          Could not detect an error sample rate
                        </span>
                      )}
                    </span>
                  </li>
                  <li>
                    <span className="location">
                      {this.state.sentryPerformanceSessionReplaySampleRate ? (
                        <span
                          className={
                            this.state.sentryPerformanceSessionReplaySampleRate <
                            ACCEPTABLE_SAMPLE_RATE
                              ? "warning"
                              : ""
                          }
                        >
                          Session Replay Sampling: {this.state.sentryPerformanceSessionReplaySampleRate}%
                          (client-side)
                        </span>
                      ) : (
                        <span className="warning">
                          Could not detect a session replay sample rate
                        </span>
                      )}
                    </span>
                  </li>
                  <li>
                    <span className="location">
                      {this.state.sentryPerformanceSessionReplayOnErrorSampleRate ? (
                        <span
                          className={
                            this.state.sentryPerformanceSessionReplayOnErrorSampleRate <
                            ACCEPTABLE_SAMPLE_RATE
                              ? "warning"
                              : ""
                          }
                        >
                          Session Replay on Error Sampling: {this.state.sentryPerformanceSessionReplayOnErrorSampleRate}%
                          (client-side)
                        </span>
                      ) : (
                        <span className="warning">
                          Could not detect a session replay on error sample rate
                        </span>
                      )}
                    </span>
                  </li>
                  <li>
                    <span className="text-muted location">
                      Sending events to <b>{this.state.dsnHost}</b> as project
                      ID <b>{this.state.projectId}</b>
                    </span>
                  </li>
                  <li>
                    <span className="text-muted location">
                      Sentry found at:{" "}
                      <a href={this.state.sentryLocation}>
                        {this.state.sentryLocation}
                      </a>
                    </span>
                  </li>
                  <li>
                    <span className="text-muted location">
                      Sentry JS SDK version is at:{" "}
                      <b>{this.state.sdkVersion}</b>
                    </span>
                  </li>
                </ul>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasNewRelic ? (
              <ListGroup.Item>
                <img className="nr-logo" src={newrelicLogo} />
                <p className="text-muted location">
                  New Relic found at:{" "}
                  <a href={this.state.newrelicLocation}>
                    {this.state.newrelicLocation}
                  </a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasBugsnag ? (
              <ListGroup.Item>
                <img className="bugsnag-logo" src={bugsnagLogo} />
                <p className="text-muted location">
                  Bugsnag found at:{" "}
                  <a href={this.state.bugsnagLocation}>
                    {this.state.bugsnagLocation}
                  </a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasRollbar ? (
              <ListGroup.Item>
                <img className="rollbar-logo" src={rollbarLogo} />
                <p className="text-muted location">
                  Rollbar found at:{" "}
                  <a href={this.state.rollbarLocation}>
                    {this.state.rollbarLocation}
                  </a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasDatadog ? (
              <ListGroup.Item>
                <img className="datadog-logo" src={datadogLogo} />
                <p className="text-muted location">
                  Datadog found at:{" "}
                  <a href={this.state.datadogLocation}>
                    {this.state.datadogLocation}
                  </a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasDatadogLogs ? (
              <ListGroup.Item>
                <img className="datadog-logo" src={datadogLogsLogo} />
                <p className="text-muted location">
                  Datadog Logs found at:{" "}
                  <a href={this.state.datadogLogsLocation}>
                    {this.state.datadogLogsLocation}
                  </a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasLogRocket ? (
              <ListGroup.Item>
                <img className="logrocket-logo" src={logrocketLogo} />
                <p className="text-muted location">
                  Logrocket found at:{" "}
                  <a href={this.state.logrocketLocation}>
                    {this.state.logrocketLocation}
                  </a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasAppDynamics ? (
              <ListGroup.Item>
                <img className="appdynamics-logo" src={appDynamicsLogo} />
                <p className="text-muted location">
                  AppDynamics found at:{" "}
                  <a href={this.state.appDynamicsLocation}>
                    {this.state.appDynamicsLocation}
                  </a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasFullStory ? (
              <ListGroup.Item>
                <img className="fullstory-logo" src={fullStoryLogo} />
                <p className="text-muted location">
                  FullStory found at:{" "}
                  <a href={this.state.fullStoryLocation}>
                    {this.state.fullStoryLocation}
                  </a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasSessionStack ? (
              <ListGroup.Item>
                <img className="sessionstack-logo" src={sessionStackLogo} />
                <p className="text-muted location">
                  SessionStack found at:{" "}
                  <a href={this.state.sessionStackLocation}>
                    {this.state.sessionStackLocation}
                  </a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasSplunk ? (
              <ListGroup.Item>
                <img className="splunk-logo" src={splunkLogo} />
                <p className="text-muted location">
                  Splunk found at:{" "}
                  <a href={this.state.splunkLocation}>
                    {this.state.splunkLocation}
                  </a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasPostHog ? (
              <ListGroup.Item>
                <img className="posthog-logo" src={postHogLogo} />
                <p className="text-muted location">
                  PostHog found at:{" "}
                  <a href={this.state.postHogLocation}>
                    {this.state.postHogLocation}
                  </a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
          </ListGroup>
        </Card.Body>
        <Card.Footer className="text-muted">
          P.S. I currently only know how to detect 6 scents: Sentry, NewRelic,
          Bugsnag, Rollbar, Datadog (RUM), +LogRocket, SplunkRum, PostHog
        </Card.Footer>
      </div>
    );
  }
}

ReactDOM.render(<Popup />, document.getElementById("root"));
