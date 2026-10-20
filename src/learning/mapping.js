export const cardKey = (c) => `${c.deck || "local"}::${c.id}`;
export function normalize(s) {
  return String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
const cache = new WeakMap();
export function suggestChapter(card, chapters, overrides = {}) {
  const key = cardKey(card);
  if (Object.hasOwn(overrides, key))
    return { chapterId: overrides[key], confidence: "manuell", manual: true };
  if (cache.get(card)?.chapters === chapters) return cache.get(card).result;
  const context = normalize((card.deck || "") + " " + (card.tags || "")),
    body = normalize(card.q + " " + card.a);
  const scored = chapters
    .map((c) => {
      let score = 0;
      for (const k of c.keywords) {
        const n = normalize(k);
        if (context.includes(n)) score += 5;
        if (body.includes(n)) score += 1;
      }
      return { chapterId: c.id, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) {
    const result = {
      chapterId: null,
      confidence: "nicht zugeordnet",
      manual: false,
    };
    cache.set(card, { chapters, result });
    return result;
  }
  const best = scored[0];
  const result = {
    chapterId: best.chapterId,
    confidence:
      best.score >= 5 && best.score > (scored[1]?.score || 0)
        ? "Vorschlag aus Deck/Tags"
        : "unsicherer Vorschlag",
    manual: false,
  };
  cache.set(card, { chapters, result });
  return result;
}
export function loadMappings() {
  try {
    return JSON.parse(localStorage.getItem("medat-topic-mapping") || "{}");
  } catch {
    return {};
  }
}
export function saveMappings(m) {
  localStorage.setItem("medat-topic-mapping", JSON.stringify(m));
  window.dispatchEvent(new Event("medat-mapping"));
}
