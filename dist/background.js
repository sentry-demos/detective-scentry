chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["content.js"],
    },
    () => {
      // Send a message to trigger the detection logic
      chrome.tabs.sendMessage(tab.id, { action: "runDetection" });
    }
  );
});
