import * as pdfjsLib from "./pdf.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.worker.mjs";

const urlParams = new URLSearchParams(window.location.search);
const fileUrl = urlParams.get("file");

let sentenceObjects = [];
// let allSentences = [];
let currentSentenceIndex = -1;

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const fileUrl = urlParams.get("file");
  const fileInput = document.getElementById("fileInput");

  if (fileInput) {
    fileInput.addEventListener("change", handleFileSelect);
  }

  document.getElementById("nextBtn").addEventListener("click", navigateNext);
  document.getElementById("prevBtn").addEventListener("click", navigatePrev);

  document.addEventListener("keydown", handleKeyboardNavigation);

  if (fileUrl) {
    loadLocalPathViaBlob(fileUrl);
  } else {
    updateStatusMessage(
      "No PDF file specified. Please use the file picker widget above",
    );
  }
});

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  updateStatusMessage(`Reading manual file selection: ${file.name}...`);

  const reader = new FileReader();
  reader.onload = function (e) {
    renderPDF({ data: e.target.result });
  };

  reader.readAsArrayBuffer(file);
}

async function loadLocalPathViaBlob(url) {
  try {
    updateStatusMessage("Loading local file path...");

    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    renderPDF({ data: arrayBuffer });
  } catch (err) {
    console.log(
      "Direct fetch blocked by CSP. Please use the file picker widget.",
      err,
    );
    updateStatusMessage(
      "Browser security blocked direct access. Please use the 'Choose File' button to open your PDF.",
    );
  }
}

async function renderPDF(sourceParam) {
  try {
    const loadingTask = pdfjsLib.getDocument(sourceParam);
    const pdf = await loadingTask.promise;

    console.log(`Success. Local PDF loaded with ${pdf.numPages} pages`);

    const container = document.getElementById("pdf-container");
    container.innerHTML = "";
    sentenceObjects = [];
    // allSentences = [];sss
    currentSentenceIndex = -1;

    updateStatusMessage(`Parsing document... Found ${pdf.numPages} pages.`);

    // let completeDocumentText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      const viewport = page.getViewport({ scale: 1.5 });

      const pageDiv = document.createElement("div");
      pageDiv.className = "page-container";
      pageDiv.style.width = `${viewport.width}px`;
      pageDiv.style.height = `${viewport.height}px`;
      container.appendChild(pageDiv);

      const canvas = document.createElement("canvas");
      canvas.className = "page-canvas";
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      pageDiv.appendChild(canvas);

      const renderContext = {
        canvasContext: canvas.getContext("2d"),
        viewport: viewport,
      };
      await page.render(renderContext).promise;

      const textLayerDiv = document.createElement("div");
      textLayerDiv.className = "textLayer";

      textLayerDiv.style.setProperty("--scale-factor", "1.5");
      pageDiv.appendChild(textLayerDiv);

      const textContent = await page.getTextContent();
      const textLayer = new pdfjsLib.TextLayer({
        textContentSource: textContent,
        container: textLayerDiv,
        viewport: viewport,
      });
      await textLayer.render();

      const pageSpans = Array.from(textLayerDiv.querySelectorAll("span"));

      let activeSentenceText = "";
      let activeSentenceSpans = [];

      for (let span of pageSpans) {
        const textChunk = span.textContent.trim();
        if (!textChunk) continue;

        activeSentenceText += (activeSentenceText ? " " : "") + textChunk;
        activeSentenceSpans.push(span);

        if (/[.!?]$/.test(textChunk)) {
          sentenceObjects.push({
            text: activeSentenceText.replace(/\s+/g, " "),
            elements: activeSentenceSpans,
          });

          activeSentenceText = "";
          activeSentenceSpans = [];
        }
      }

      if (activeSentenceSpans.length > 0) {
        sentenceObjects.push({
          text: activeSentenceText.replace(/\s+/g, " "),
          elements: activeSentenceSpans,
        });
      }
    }
    updateStatusMessage(
      `Ready! Parsed ${sentenceObjects.length} sentences. Click 'Next Sentence' to begin.`,
    );
  } catch (error) {
    console.log("PDF.js loading engine failure:", error);
    updateStatusMessage(
      "Error opening document framework. Check console logs for errors.",
    );
  }
}

function navigateNext() {
  if (sentenceObjects.length === 0) return;

  if (currentSentenceIndex < sentenceObjects.length - 1) {
    currentSentenceIndex++;
    displayCurrentSentence();
  } else {
    updateStatusMessage("End of PDF document reached.");
  }
}

function navigatePrev() {
  if (sentenceObjects.length === 0) return;

  if (currentSentenceIndex > 0) {
    currentSentenceIndex--;
    displayCurrentSentence();
  }
}

function displayCurrentSentence() {
  const textDisplay = document.getElementById("current-text");
  if (!textDisplay || sentenceObjects.length === 0) return;

  const currentTarget = sentenceObjects[currentSentenceIndex];

  textDisplay.innerText = currentTarget.text;

  document.querySelectorAll(".active-sentence").forEach((el) => {
    el.classList.remove("active-sentence");
  });

  currentTarget.elements.forEach((span) => {
    span.classList.add("active-sentence");
  });

  if (currentTarget.elements.length > 0) {
    currentTarget.elements[0].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}

function updateStatusMessage(msg) {
  const textDisplay = document.getElementById("current-text");
  if (textDisplay) {
    textDisplay.innerText = msg;
  }
}

function handleKeyboardNavigation(event) {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    return;
  }

  if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    navigateNext();
    return;
  }

  if (event.key === "Tab") {
    if (event.shiftKey) {
      event.preventDefault();
      navigatePrev();
      return;
    }
  }
}
