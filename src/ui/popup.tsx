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

interface IProps {
}

interface IState {
  hasSentry?: boolean;
  hasNewRelic?: boolean;
  hasBugsnag?: boolean;
  hasRollbar?: boolean;
  hasDatadog?: boolean;
  hasLogRocket?: boolean;
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
