// chrome.action.onClicked.addListener(async (tab) => {
//   if (!tab.url) return;

//   if (tab.url.startsWith("file:///")) {
//     const viewerUrl =
//       chrome.runtime.getURL("viewer.html") +
//       "?file=" +
//       encodeURIComponent(tab.url);

//     chrome.tabs.update(tab.id, { url: viewerUrl });
//   }
//   // chrome.scripting.executeScript({
//   //   target: { tabId: tab.id },
//   //   files: ["content.js"],
//   // });
// });

chrome.runtime.onMessage.addListener((message, sender, sendRespone) => {
  if (message.action === "open_local_pdf") {
    const viewerUrl =
      chrome.runtime.getURL("viewer.html") +
      "?file=" +
      encodeURIComponent(message.url);

    chrome.tabs.update(sender.tab ? sender.tab.id : undefined, {
      url: viewerUrl,
    });
  }
});
