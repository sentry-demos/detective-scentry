import * as React from "react"
import * as ReactDOM from "react-dom"

import "../styles/popup.css"

interface IProps {
}

interface IState {
  hasSentry?: boolean,
  hasNewRelic?: boolean;
}

class Hello extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      hasSentry: false,
      hasNewRelic: false
    };
  }
  componentDidMount() {
    let that = this;

     function getScripts() {
       return Array.from(document.getElementsByTagName("script")).map(
         (h) => h.outerHTML
       );
     }

     function getWindowSentry() {
       return localStorage.hasSentry;
     }

    function getWindowNewRelic() {
      return localStorage.hasNewRelic;
    }

    // check for Sentry
     let hasSentry = false;
     chrome.tabs.executeScript(
       {
         code: "(" + getWindowSentry + ")();"
       },
       (results) => {
         if (!!results[0] && results[0] === "true") {
           hasSentry = true;
           that.setState({hasSentry: true})
         } else {
           chrome.tabs.query(
             {
               active: true,
               currentWindow: true,
             },
             (tabs) => {
               let url = tabs[0].url;

               chrome.tabs.executeScript(
                 {
                   code: "(" + getScripts + ")();", //argument here is a string but function.toString() returns function's code
                 },
                 (results) => {
                   if (results.length > 0 && results[0].length > 0) {
                     let i = 0;
                     while (i < results[0].length && !hasSentry) {
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
                             if (text.includes("dsn:")) {
                               // to figure out if using sentry.io or on-prem/rev-proxy, as well as Raven
                               hasSentry = true;
                               that.setState({hasSentry: true})
                             }
                           })
                           .catch((error) => {
                             console.log(error);
                           });
                       } else if (scriptString.toLowerCase().includes("dsn:")) {
                         hasSentry = true;
                         that.setState({hasSentry: true})
                       }
                       i++;
                     }
                     hasSentry = false;
                     that.setState({ hasSentry: false })
                   } else {
                     console.log("Did not find any script tags");
                     hasSentry = false;
                     that.setState({ hasSentry: false })
                   }
                 }
               );
             }
           );
         }
       }
     );



    // check for New Relic
    chrome.tabs.executeScript(
      {
        code: "(" + getWindowNewRelic + ")();"
      }, (results) => {
        if (!!results[0] && results[0] === "true") {
          // TODO
          that.setState({hasNewRelic: true});
        }
      }
    );

  }

  render() {
    return (
      <div className="popup-padded">
        <h1>Hello fellow SDK detective!</h1>
        <img src="https://github.com/ndmanvar/hackweek-2020/blob/master/images/santo.jpg?raw=true" />
        <br/>
        <p>Woof, my name is Santo and I have begun sniffing for SDKs</p>

        <p>p.s. I currently only know how to detect 2 scents: Sentry + NewRelic</p>

        <p>I smelled me some...</p>

        <div>
          {this.state.hasSentry ? <img className="sentry-logo" src="https://github.com/ndmanvar/hackweek-2020/blob/master/images/sentry-logo.png?raw=true"/>  : ""}
          {this.state.hasNewRelic ? <img className="nr-logo" src="https://github.com/ndmanvar/hackweek-2020/blob/master/images/newrelic-logo.png?raw=true" /> : ""}
        </div>

      </div>
    );
  }
}

// --------------

ReactDOM.render(
    <Hello />,
    document.getElementById('root')
)
