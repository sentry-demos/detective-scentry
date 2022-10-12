import "../styles/popup.css"
import "bootstrap/dist/css/bootstrap.min.css";

import * as React from "react"
import * as ReactDOM from "react-dom"

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

let santoImg = chrome.extension.getURL("js/d2849812b2c9fca074855c2bbabd5c1f.jpg")
let sentryLogo = chrome.extension.getURL("js/03afcd320f72633f541912e5986b0f93.png")
let bugsnagLogo = chrome.extension.getURL("js/1f8c46398fd8a6133f0a8f9ebaab6b08.png")
let rollbarLogo = chrome.extension.getURL("js/affb689d9355df5b02f7e6a22ba496c6.png")
let newrelicLogo = chrome.extension.getURL("js/19c0cccebe5bdf46cc0c02b1723039a3.png")
let datadogLogo = chrome.extension.getURL("js/6f820f6928c60a37143bcb0f07adc7eb.png")
let logrocketLogo = chrome.extension.getURL("js/111b99a33e6aad0950eb4204fc06dabe.png")

let ACCEPTABLE_SAMPLE_RATE = 50

interface IProps {
}

interface IState {
  hasSentry?: boolean;
  hasNewRelic?: boolean;
  hasBugsnag?: boolean;
  hasRollbar?: boolean;
  hasDatadog?: boolean;
  hasLogRocket?: boolean;
  sentryLocation: string;
  newrelicLocation: string;
  bugsnagLocation: string;
  rollbarLocation: string;
  datadogLocation: string;
  logrocketLocation: string;
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
      hasLogRocket: false,
      sentryLocation: '',
      newrelicLocation: '',
      bugsnagLocation: '',
      rollbarLocation: '',
      datadogLocation: '',
      logrocketLocation: '',
      usesSentryPerformance: false,
      sentryPerformanceSampleRate: 0,
      sentryErrorSampleRate: 0,
      dsnHost: '',
      projectId: '',
      sdkVersion: '',
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
        that.executeScript("Array.from(document.getElementsByTagName('script')).map((h) => h.outerHTML);",
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
    chrome.tabs.executeScript(
      { code },
      (results) => {
        if (
          results &&
          results.length > 0 &&
          !!results[0]
          // results[0] === "true"
        ) {
          successFunc(results);
        }
      }
    );
  }

  componentDidMount() {
    // check for Sentry
    this.executeScript("localStorage.hasSentry;", (results) => this.setState({ hasSentry: results[0] === "true" }) );
    this.executeScript("localStorage.hasNewRelic;", (results) => this.setState({ hasNewRelic: results[0] === "true" }));
    this.executeScript("localStorage.hasBugsnag;", (results) => this.setState({ hasBugsnag: results[0] === "true" }));
    this.executeScript("localStorage.hasRollbar;", (results) => this.setState({ hasRollbar: results[0] === "true" }));
    this.executeScript("localStorage.hasDatadog;", (results) => this.setState({ hasDatadog: results[0] === "true" }));
    this.executeScript("localStorage.hasLogRocket;", (results) => this.setState({ hasLogRocket: results[0] === "true" }));

    // get location where observability tool was detected.
    // This is done so that if a tool was detected in a third-party frame,
    // like Recaptcha, we can be aware of it and determine whether it's a false positive.
    this.executeScript("localStorage.sentryLocation;", (results) => this.setState({ sentryLocation: results[0]}) );
    this.executeScript("localStorage.newrelicLocation;", (results) => this.setState({ newrelicLocation: results[0]}) );
    this.executeScript("localStorage.bugsnagLocation;", (results) => this.setState({ sentryLocation: results[0]}) );
    this.executeScript("localStorage.rollbarLocation;", (results) => this.setState({ rollbarLocation: results[0]}) );
    this.executeScript("localStorage.datadogLocation;", (results) => this.setState({ datadogLocation: results[0]}) );
    this.executeScript("localStorage.logrocketLocation;", (results) => this.setState({ logrocketLocation: results[0]}) );

    // Check for presence of Sentry-specific values
    this.executeScript("localStorage.usesSentryPerformance;", (results) => this.setState({ usesSentryPerformance: results[0] === "true" }));
    this.executeScript("localStorage.sentryPerformanceSampleRate;", (results) => this.setState({ sentryPerformanceSampleRate: results[0] }));
    this.executeScript("localStorage.sentryErrorSampleRate;", (results) => this.setState({ sentryErrorSampleRate: results[0] }));
    this.executeScript("localStorage.dsnHost;", (results) => this.setState({ dsnHost: results[0] }));
    this.executeScript("localStorage.projectId;", (results) => this.setState({ projectId: results[0] }));
    this.executeScript("localStorage.sdkVersion;", (results) => this.setState({ sdkVersion: results[0] }));
  }

  render() {
    return (
      <div className="popup-padded">
        <Card.Header>Detective Scentry here!</Card.Header>
        <Card.Body>
          <Card.Img src={santoImg} />
          {/* <Card.Title>Detective Scentry Here!</Card.Title> */}
          <Card.Subtitle className="mb-2 text-muted">
            Woof! My name is Santo and I detect SDKs.
          </Card.Subtitle>
          <p className="lead tooltip">...I have begun sniffing for SDKs...</p>
          <Card.Text>I smelled me some:</Card.Text>
          <ListGroup variant="flush">
            {this.state.hasSentry ? (
              <ListGroup.Item>
                <img
                  className="sentry-logo"
                  src={sentryLogo}
                />
                <ul>
                  <li>
                    <span className="location">
                      {this.state.sentryErrorSampleRate ? (
                        <span className={(this.state.sentryErrorSampleRate < ACCEPTABLE_SAMPLE_RATE) ? "warning" : "success"}>
                          Error Sampling: {this.state.sentryErrorSampleRate}% (client-side)
                        </span>
                      ) : (
                        <span className="warning">
                          Could not detect an error sample rate
                        </span>
                      )
                    }
                    </span>
                  </li>
                  <li>
                    {this.state.usesSentryPerformance ? (
                      <span className="location">
                        <span> Using Sentry performance</span> <br/>
                        <span className={(this.state.sentryPerformanceSampleRate < ACCEPTABLE_SAMPLE_RATE) ? "warning" : "success"}>
                          Transaction Sampling: {this.state.sentryPerformanceSampleRate}% (client-side)
                        </span>
                      </span>
                    ) : (
                      <span className="location warning">
                        Does not use Sentry performance!
                      </span>
                    )}
                  </li>
                  <li>
                    <span className="text-muted location">
                      Sending events to <b>{this.state.dsnHost}</b> as project ID <b>{this.state.projectId}</b>
                    </span>
                  </li>
                  <li>
                    <span className="text-muted location">
                      Sentry found at: <a href={this.state.sentryLocation}>{this.state.sentryLocation}</a>
                    </span>
                  </li>
                  <li>
                    <span className="text-muted location">
                      Sentry JS SDK version is at: <b>{this.state.sdkVersion}</b>
                    </span>
                  </li>
                </ul>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasNewRelic ? (
              <ListGroup.Item>
                <img
                  className="nr-logo"
                  src={newrelicLogo}
                />
                <p className="text-muted location">
                  New Relic found at: <a href={this.state.newrelicLocation}>{this.state.newrelicLocation}</a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasBugsnag ? (
              <ListGroup.Item>
                <img
                  className="bugsnag-logo"
                  src={bugsnagLogo}
                />
                <p className="text-muted location">
                  Bugsnag found at: <a href={this.state.bugsnagLocation}>{this.state.bugsnagLocation}</a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasRollbar ? (
              <ListGroup.Item>
                <img
                  className="rollbar-logo"
                  src={rollbarLogo}
                />
                <p className="text-muted location">
                  Rollbar found at: <a href={this.state.rollbarLocation}>{this.state.rollbarLocation}</a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasDatadog ? (
              <ListGroup.Item>
                <img
                  className="datadog-logo"
                  src={datadogLogo}
                />
                <p className="text-muted location">
                  Datadog found at: <a href={this.state.datadogLocation}>{this.state.datadogLocation}</a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasLogRocket ? (
              <ListGroup.Item>
                <img
                  className="logrocket-logo"
                  src={logrocketLogo}
                />
                <p className="text-muted location">
                  Logrocket found at: <a href={this.state.logrocketLocation}>{this.state.logrocketLocation}</a>
                </p>
              </ListGroup.Item>
            ) : (
              ""
            )}
          </ListGroup>
        </Card.Body>
        <Card.Footer className="text-muted">
          P.S. I currently only know how to detect 6 scents: Sentry, NewRelic, Bugsnag, Rollbar, Datadog (RUM), +LogRocket
        </Card.Footer>
      </div>
    );
  }
}

ReactDOM.render(
  <Popup />,
  document.getElementById('root')
)
