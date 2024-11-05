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
  sentryLocation: string;
  newrelicLocation: string;
  bugsnagLocation: string;
  rollbarLocation: string;
  datadogLocation: string;
  datadogLogsLocation: string;
  logrocketLocation: string;
  appDynamicsLocation: string;
  sessionStackLocation: string;
  fullStoryLocation: string;
  usesSentryPerformance?: boolean;
  sentryPerformanceSampleRate?: number;
  sentryErrorSampleRate?: number;
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
      usesSentryPerformance: false,
      sentryPerformanceSampleRate: 0,
      sentryErrorSampleRate: 0,
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

  executeScript(code, successFunc) {
    chrome.tabs.executeScript({ code }, (results) => {
      if (
        results &&
        results.length > 0 &&
        !!results[0]
        // results[0] === "true"
      ) {
        successFunc(results);
      }
    });
  }

  randomSantoImage() {
    const randomIndex = Math.floor(Math.random() * petImages.length);
    randomPet = petImages[randomIndex];
    return chrome.runtime.getURL(randomPet);
  }

  componentDidMount() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id;

      // @ts-ignore
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTabId },
          files: ["content.js"],
        },
        () => {
          // Listen for messages from `content.js`
          chrome.runtime.onMessage.addListener((message) => {
            if (message.action === "detectionResults") {
              console.log("Received detection results:", message.data); // Debug log
              this.setState(message.data);
            }
          });

          // Trigger the SDK detection process in `content.js`
          chrome.tabs.sendMessage(activeTabId, { action: "runDetection" });
        }
      );
    });

    chrome.storage.local.get(
      [
        "hasSentry",
        "hasNewRelic",
        "hasBugsnag",
        "hasRollbar",
        "hasDatadog",
        "hasDatadogLogs",
        "hasLogRocket",
        "hasAppDynamics",
        "hasFullStory",
        "hasSessionStack",
        "sentryLocation",
        "newrelicLocation",
        "bugsnagLocation",
        "rollbarLocation",
        "datadogLocation",
        "datadogLogsLocation",
        "logrocketLocation",
        "appDynamicsLocation",
        "fullStoryLocation",
        "sessionStackLocation",
        "usesSentryPerformance",
        "sentryPerformanceSampleRate",
        "sentryErrorSampleRate",
        "dsnHost",
        "projectId",
        "sdkVersion",
      ],
      (data) => {
        this.setState({
          hasSentry: data.hasSentry,
          hasNewRelic: data.hasNewRelic,
          hasBugsnag: data.hasBugsnag,
          hasRollbar: data.hasRollbar,
          hasDatadog: data.hasDatadog,
          hasDatadogLogs: data.hasDatadogLogs,
          hasLogRocket: data.hasLogRocket,
          hasAppDynamics: data.hasAppDynamics,
          hasFullStory: data.hasFullStory,
          hasSessionStack: data.hasSessionStack,
          sentryLocation: data.sentryLocation,
          newrelicLocation: data.newrelicLocation,
          bugsnagLocation: data.bugsnagLocation,
          rollbarLocation: data.rollbarLocation,
          datadogLocation: data.datadogLocation,
          datadogLogsLocation: data.datadogLogsLocation,
          logrocketLocation: data.logrocketLocation,
          appDynamicsLocation: data.appDynamicsLocation,
          fullStoryLocation: data.fullStoryLocation,
          sessionStackLocation: data.sessionStackLocation,
          usesSentryPerformance: data.usesSentryPerformance,
          sentryPerformanceSampleRate: data.sentryPerformanceSampleRate,
          sentryErrorSampleRate: data.sentryErrorSampleRate,
          dsnHost: data.dsnHost,
          projectId: data.projectId,
          sdkVersion: data.sdkVersion,
        });
      }
    );
  }

  render() {
    return (
      <div className="popup-padded">
        <Card.Header>Detective Scentry here!</Card.Header>
        <Card.Body>
          <Card.Img src={this.randomSantoImage()} />
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
                        <span> Using Sentry performance</span> <br />
                        <span
                          className={
                            this.state.sentryPerformanceSampleRate <
                            ACCEPTABLE_SAMPLE_RATE
                              ? "warning"
                              : "success"
                          }
                        >
                          Transaction Sampling:{" "}
                          {this.state.sentryPerformanceSampleRate}%
                          (client-side)
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
          </ListGroup>
        </Card.Body>
        <Card.Footer className="text-muted">
          P.S. I currently only know how to detect 6 scents: Sentry, NewRelic,
          Bugsnag, Rollbar, Datadog (RUM), +LogRocket
        </Card.Footer>
      </div>
    );
  }
}

ReactDOM.render(<Popup />, document.getElementById("root"));
