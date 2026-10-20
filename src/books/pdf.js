import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
GlobalWorkerOptions.workerSrc = workerUrl;
export function openPdf(data) {
  return getDocument({ data, isEvalSupported: false, useSystemFonts: true })
    .promise;
}
