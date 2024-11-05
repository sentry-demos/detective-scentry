/**
 * injectScript - Inject internal script to available access to the `window`
 *
 * @param  {type} file_path Local path of the internal script.
 * @param  {type} tag The tag as string, where the script will be append (default: 'body').
 * @see    {@link http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script}
 */

// Check if `content.js` has already been injected
if (!window.contentScriptInjected) {
  // Set a flag on the window object to avoid multiple injections
  window.contentScriptInjected = true;

  // Inject `content.js`
  function injectScript(file_path, tag) {
    const node = document.getElementsByTagName(tag)[0];
    const script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", file_path);
    node.appendChild(script);
  }

  injectScript(chrome.runtime.getURL("content.js"), "body");
}
