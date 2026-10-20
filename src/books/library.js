import books from "./books.json";
import { loadBook, saveBook } from "../storage";
const documents = new Map();
export { books };
export async function getBookDocument(id) {
  if (documents.has(id)) return documents.get(id);
  const promise = (async () => {
    const file = await loadBook(id);
    if (!file) return null;
    const { openPdf } = await import("./pdf");
    return openPdf(new Uint8Array(await file.arrayBuffer()));
  })();
  documents.set(id, promise);
  try {
    const result = await promise;
    if (!result) documents.delete(id);
    return result;
  } catch (e) {
    documents.delete(id);
    throw e;
  }
}
export async function importBook(file) {
  const data = await file.arrayBuffer();
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", data))]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  const book = books.find((b) => b.sha256 === hash);
  if (!book)
    throw new Error(
      `${file.name}: Diese Datei entspricht keiner der fünf zugeordneten Skriptausgaben. Bitte die ursprünglich genannten PDFs auswählen, damit Bildausschnitte und Seitenangaben stimmen.`,
    );
  await saveBook(book.id, file);
  const previous = documents.get(book.id);
  documents.delete(book.id);
  if (previous) previous.then((doc) => doc?.destroy()).catch(() => {});
  window.dispatchEvent(new Event("medat-books"));
  return book;
}
