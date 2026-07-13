// import * as pdfjsLib from "./pdf.mjs";
// pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.worker.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url) return;

  if (tab.url.startsWith("file:///")) {
    chrome.runtime.sendMessage({ action: "open_local_pdf", url: tab.url });

    window.close();
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  }
});

// async function startNavigation() {
//   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//   if (!tab || !tab.url) return;

//   if (
//     tab.url.startsWith("chrome://") ||
//     tab.url.startsWith("chrome-extension://")
//   ) {
//     alert(
//       "Chrome blocks extensions on internal system pages. Please open a PDF on a web page or see below.",
//     );
//     return;
//   }

//   if (tab.url.startsWith("file:///")) {
//     console.log("Attempting to run on a local file...");
//   }

//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ["content.js"],
//   });
// }

// document.getElementById("nextBtn").addEventListener("click", startNavigation);

// let sentences = [];

// let currentIndex = 0;

// let getSentences = (text) => {
//   const regex = /[^.!?]+[.!?]+(\s|$)/g;
//   const matches = text.match(regex);
//   return matches ? matches.map((s) => s.trim()) : [];
// };

// let extractPDFText = async () => {
//   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//   chrome.scripting
//     .executeScript({
//       target: { tabId: tab.id },
//       func: () => document.body.innerText,
//     })
//     .then((injectionResults) => {
//       const fullText = injectionResults[0].result;
//       sentences = getSentences(fullText);
//       currentIndex = 0;
//       updateDisplay();
//     });
// };

// let updateDisplay = () => {
//   const display = document.getElementById("textDisplay");
//   if (sentences.length > 0) {
//     display.textContent = sentences[currentIndex];
//   } else {
//     display.textContent = "No sentences found. Ensure a PDF is open";
//   }
// };

// document.getElementById("nextBtn").addEventListener("click", () => {
//   if (currentIndex < sentences.length - 1) {
//     currentIndex++;
//     updateDisplay();
//   }
// });

// document.getElementById("prevBtn").addEventListener("click", () => {
//   if (currentIndex > 0) {
//     currentIndex--;
//     updateDisplay();
//   }
// });

// extractPDFText();
