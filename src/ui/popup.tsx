import "../styles/popup.css"
import "bootstrap/dist/css/bootstrap.min.css";

import * as React from "react"
import * as ReactDOM from "react-dom"

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

interface IProps {
}

interface IState {
  hasSentry?: boolean;
  hasNewRelic?: boolean;
  hasBugsnag?: boolean;
}

class Hello extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      hasSentry: false,
      hasNewRelic: false,
      hasBugsnag: false
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
  }

  render() {
    return (
      <div className="popup-padded">
        <Card.Header>Detective Scentry here!</Card.Header>
        <Card.Body>
          <Card.Img src="https://github.com/ndmanvar/hackweek-2020/blob/master/images/santo.jpg?raw=true" />
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
                  src="https://github.com/ndmanvar/hackweek-2020/blob/master/images/sentry-logo.png?raw=true"
                />
              </ListGroup.Item>
            ) : (
              ""
            )}
            {this.state.hasNewRelic ? (
              <ListGroup.Item>
                <img
                  className="nr-logo"
                  src="https://github.com/ndmanvar/hackweek-2020/blob/master/images/newrelic-logo.png?raw=true"
                />
              </ListGroup.Item>
            ) : (
              ""
            )}
            {/* {this.state.hasBugsnag ? (
              <ListGroup.Item>
                <img
                  className="bugsnag-logo"
                  src="https://github.com/ndmanvar/hackweek-2020/blob/master/images/newrelic-logo.png?raw=true"
                />
              </ListGroup.Item>
            ) : (
              ""
            )} */}
          </ListGroup>
        </Card.Body>
        <Card.Footer className="text-muted">
          P.S. I currently only know how to detect 2 scents: Sentry + NewRelic
        </Card.Footer>
      </div>
    );
  }
}

ReactDOM.render(
  <Hello />,
  document.getElementById('root')
)
