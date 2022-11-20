chrome.runtime.onInstalled.addListener(() => {
  console.log("docview extension background script is successfully installed in runtime!");
});
chrome.action.onClicked.addListener((tab) => {
  console.log(tab)
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});