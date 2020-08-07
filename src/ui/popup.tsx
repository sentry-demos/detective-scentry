import * as React from "react"
import * as ReactDOM from "react-dom"

import "../styles/popup.css"

interface IProps {
}

interface IState {
  races?: string;
}

class Hello extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      races: "abc",
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

     let hasSentry = false;

     chrome.tabs.executeScript(
       {
         code: "(" + getWindowSentry + ")();", //argument here is a string but function.toString() returns function's code
       },
       (results) => {
         if (!!results[0] && results[0] === "true") {
           hasSentry = true;
           that.setState({races: "true"})
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
                               that.setState({races: "true"})
                               alert("has Sentry via NPM/YARN");
                             }
                           })
                           .catch((error) => {
                             alert(error);
                             console.log(error);
                           });
                       } else if (scriptString.toLowerCase().includes("dsn:")) {
                         hasSentry = true;
                         that.setState({races: "true"})
                         alert("has Sentry via NPM/YARN");
                       }
                       i++;
                     }
                   } else {
                     console.log("Did not find any script tags");
                   }
                 }
               );
             }
           );
         }
         if (hasSentry) {
           alert("has Sentry via CDN");
         }
       }
     );

  }

  render() {
    return (
      <div className="popup-padded">
        <h1>Hello fellow SDK detective!</h1>
        <h2>{this.state.races}</h2>
        <img src="https://github.com/ndmanvar/hackday2020/blob/cdn-detect/images/santo.jpg?raw=true" />
      </div>
    );
  }
}

// --------------

ReactDOM.render(
    <Hello />,
    document.getElementById('root')
)
