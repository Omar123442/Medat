// Three-set finite-model semantics. A mask selects which of the eight Venn
// regions contain at least one object. Universal statements do not imply existence.
export const statement = (kind, from, to) => ({ kind, from, to });
export function holds(s, model) {
  const occupied = Array.from({ length: 8 }, (_, i) => i).filter(
    (i) => model & (1 << i),
  );
  const is = (i, set) => Boolean(i & (1 << set));
  if (s.kind === "all")
    return occupied.every((i) => !is(i, s.from) || is(i, s.to));
  if (s.kind === "none")
    return occupied.every((i) => !is(i, s.from) || !is(i, s.to));
  if (s.kind === "some")
    return occupied.some((i) => is(i, s.from) && is(i, s.to));
  if (s.kind === "notall")
    return occupied.some((i) => is(i, s.from) && !is(i, s.to));
  throw new Error("Unknown logical quantifier");
}
export function modelsFor(premises) {
  return Array.from({ length: 256 }, (_, i) => i).filter((m) =>
    premises.every((p) => holds(p, m)),
  );
}
export function entailed(s, models) {
  return models.length > 0 && models.every((m) => holds(s, m));
}
export function describe(s, names) {
  const a = names[s.from],
    b = names[s.to];
  return {
    all: `Alle ${a} sind ${b}.`,
    none: `Keine ${a} sind ${b}.`,
    some: `Einige ${a} sind ${b}.`,
    notall: `Einige ${a} sind keine ${b}.`,
  }[s.kind];
}
export function witness(s, models, names) {
  const model = models.find((m) => !holds(s, m));
  if (model === undefined) return null;
  const objects = [];
  for (let i = 0; i < 8; i++)
    if (model & (1 << i)) {
      objects.push(
        `${objects.length + 1}. Objekt: ` +
          names
            .map(
              (n, j) =>
                `${i & (1 << j) ? "gehört zu" : "gehört nicht zu"} „${n}“`,
            )
            .join(", "),
      );
    }
  return objects.length
    ? objects
    : [
        "Alle drei Gruppen können leer sein. Die Allaussagen bleiben dabei erfüllt.",
      ];
}
export const conclusions = [
  statement("all", 0, 2),
  statement("all", 2, 0),
  statement("none", 0, 2),
  statement("some", 0, 2),
  statement("notall", 0, 2),
  statement("notall", 2, 0),
];
export const negate = (s) => ({
  ...s,
  kind: { all: "notall", notall: "all", none: "some", some: "none" }[s.kind],
});
