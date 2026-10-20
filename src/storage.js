function open() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("medat-campus", 3);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains("files"))
        r.result.createObjectStore("files");
      if (!r.result.objectStoreNames.contains("books"))
        r.result.createObjectStore("books", { keyPath: "id" });
      if (!r.result.objectStoreNames.contains("reviews"))
        r.result.createObjectStore("reviews", { keyPath: "key" });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export async function loadDeck() {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const r = db.transaction("files").objectStore("files").get("deck");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  } finally {
    db.close();
  }
}
export async function saveDeck(file) {
  const db = await open();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").put(file, "deck");
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function loadReviews() {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const r = db.transaction("reviews").objectStore("reviews").getAll();
      r.onsuccess = () =>
        resolve(Object.fromEntries(r.result.map((x) => [x.key, x])));
      r.onerror = () => reject(r.error);
    });
  } finally {
    db.close();
  }
}
export async function saveReview(record) {
  const db = await open();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("reviews", "readwrite");
      tx.objectStore("reviews").put(record);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function saveBook(id, file) {
  const db = await open();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("books", "readwrite");
      tx.objectStore("books").put({ id, file });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export async function loadBook(id) {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const r = db.transaction("books").objectStore("books").get(id);
      r.onsuccess = () => resolve(r.result?.file);
      r.onerror = () => reject(r.error);
    });
  } finally {
    db.close();
  }
}
export async function listBooks() {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const r = db.transaction("books").objectStore("books").getAllKeys();
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  } finally {
    db.close();
  }
}
