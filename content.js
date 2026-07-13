async function initPdfNavigator() {
  const pdfjsLib = await import(chrome.runtime.getURL("pdf.mjs"));

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    chrome.runtime.getURL("pdf.worker.mjs");

  const pdfUrl = window.location.href;
  if (pdfUrl.endsWith(".pdf")) {
    loadAndNavigatePDF(pdfjsLib, pdfUrl);
  }
}

async function loadAndNavigatePDF(pdfjsLib, pdfUrl) {
  const loadingTask = pdfjsLib.getDocument(pdfUrl);
  const pdf = await loadingTask.promise;

  console.log(`Successfully loaded PDF with ${pdf.numPages} pages using ESM!`);

  let allSentences = [];

  for (let pageNum = 1; pageNum < pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");

    const sentences = pageText.match(/[^.!?]+[.!?]+(\s|$)/g || [pageText]);

    allSentences.push(...sentences);
  }

  let currentSentenceIndex = 0;

  function nextSentence() {
    if (currentSentenceIndex < allSentences.length) {
      console.log("Current Sentence:", allSentences[currentSentenceIndex]);

      currentSentenceIndex++;
    }
  }

  function previousSentence() {
    if (currentSentenceIndex > 0) {
      currentSentenceIndex--;
      console.log("Current Sentence:", allSentences[currentSentenceIndex]);
    }
  }
}

initPdfNavigator();
