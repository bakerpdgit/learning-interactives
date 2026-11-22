// Keep marking data on its own line so labels can keep their existing syntax.
function readMarkingHeader(text, prefix, isValid) {
  if (!text.startsWith(prefix)) return [{}, text];
  const end = text.indexOf("\n");
  if (end === -1) return [{}, text];
  try {
    const settings = JSON.parse(text.slice(prefix.length, end));
    if (settings && !Array.isArray(settings) && typeof settings === "object" && isValid(settings)) {
      return [settings, text.slice(end + 1)];
    }
  } catch {
    // A legacy label can begin with the same prefix.
  }
  return [{}, text];
}

export function writeMarkingHeader(prefix, settings, body) {
  return Object.keys(settings).length ? prefix + JSON.stringify(settings) + "\n" + body : body;
}

export const orderedLineHeader = "ORDERED-LINE:";
export const categoriseHeader = "CATEGORISE:";

export function readOrderedLine(text) {
  return readMarkingHeader(text, orderedLineHeader, (settings) =>
    Object.keys(settings).length > 0 && Object.entries(settings).every(([key, value]) =>
      key === "x" || key === "y" ? typeof value === "string" :
        (key === "xRanks" || key === "yRanks") && Array.isArray(value) && value.every(Number.isInteger)));
}

export function readCategorise(text) {
  return readMarkingHeader(text, categoriseHeader, (settings) =>
    Object.keys(settings).length > 0 && Object.entries(settings).every(([key, value]) =>
      key === "add" ? typeof value === "boolean" :
        key === "answers" && Array.isArray(value) && value.every((answer) => answer === null || Number.isInteger(answer))));
}

export function validRanks(ranks, count) {
  return Array.isArray(ranks) && ranks.length === count && new Set(ranks).size === count &&
    ranks.every((rank) => Number.isInteger(rank) && rank >= 1 && rank <= count);
}

export function multiSelectQuestions(value = "") {
  return new Set(value.split(";").filter((part) => /^[1-9]\d*$/.test(part)).map(Number));
}
