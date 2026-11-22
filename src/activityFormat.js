
import LZString from "lz-string";

export const LOCAL_MARKER = "[local]";
export const IMAGE_SEPARATOR = "|~|";
export const AUDIO_SEPARATOR = "|¦|";
export const SHARE_LIMIT = 2000;
export const compressText = LZString.compressToEncodedURIComponent;
export const decompressText = LZString.decompressFromEncodedURIComponent;

export function activityUrl(params, base = window.location.href) {
  const url = new URL(base);
  url.search = new URLSearchParams(params);
  url.hash = "";
  if (url.hostname === "www.classinteractives.co.uk") url.protocol = "https:";
  return url.href;
}

export function localActivitySearch(id, edit = false) {
  return new URLSearchParams({id, txt: compressText(edit ? "localedit" : "localrun")}).toString();
}

export function readActivityRequest(search) {
  const params = new URLSearchParams(search);
  const id = params.get("id");
  const encoded = params.get("txt");
  if (/^https?:\/\//i.test(encoded || "")) {
    try { new URL(encoded); return { id, remote: encoded }; }
    catch { return { id, mode: "invalid" }; }
  }
  if (!encoded) return { id, mode: "new" };
  const text = decompressText(encoded)?.trim();
  if (!text) return { id, mode: "invalid" };
  if (text === "localedit" || text === "localrun") return { id, mode: text };
  return { id, mode: "public", text };
}

export function makeDirectLink(id, text, media, base) {
  if (media || !text) return null;
  const url = activityUrl({ id, txt: compressText(text) }, base);
  return new Blob([url]).size <= SHARE_LIMIT ? url : null;
}

function decodeAudio(data) {
  const match = /^data:([^,]+);base64,([A-Za-z0-9+/=]+)$/.exec(data);
  if (!match) throw new Error("The saved recording is invalid.");
  const bytes = Uint8Array.from(atob(match[2]), (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: match[1] });
}

export function readActivityFile(content, fallbackId) {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  const data = lines.find((line) => line.trimStart().startsWith("ActivityData:"))
    ?.trim().slice("ActivityData:".length);
  const linkLine = lines.find((line) => /^https?:\/\//i.test(line.trim()) &&
    new URLSearchParams(line.trim().split("?")[1] || "").has("id"));
  const request = linkLine ? readActivityRequest(new URL(linkLine.trim()).search) : {};
  const id = request.id || fallbackId;
  const [payload, image] = (data || "").split(IMAGE_SEPARATOR, 2);
  const [compressed, audio] = payload.split(AUDIO_SEPARATOR, 2);
  let text = request.text || (compressed && decompressText(compressed));
  let media = audio ? decodeAudio(audio) : image ? decompressText(image) : null;
  if (!id || !text) throw new Error("This file doesn’t contain a saved activity.");
  if ((id === "2" || id === "19") && !media) {
    const textLines = text.split("\n");
    const lastLine = textLines.at(-1);
    if (/^data:image\//i.test(lastLine)) {
      media = lastLine;
      textLines[textLines.length - 1] = LOCAL_MARKER;
      text = textLines.join("\n");
    }
  }
  return { id, text, media };
}

export async function fetchActivity(url, id, signal) {
  let response;
  try {
    response = await fetch(url, { signal, credentials: "omit" });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("The activity file couldn’t be reached. Check that it is public and that this network allows its host.");
  }
  if (!response.ok) throw new Error("The activity file couldn’t be opened (HTTP " + response.status + ").");
  return readActivityFile(await response.text(), id);
}

function readBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The recording couldn’t be added to the file."));
    reader.readAsDataURL(blob);
  });
}

export async function makeActivityFile({ id, text, media }, base) {
  const link = makeDirectLink(id, text, media, base) ||
    activityUrl({ id, txt: compressText("localrun") }, base);
  const payload = compressText(text);
  const attachment = media instanceof Blob ? AUDIO_SEPARATOR + await readBlob(media) :
    media ? IMAGE_SEPARATOR + compressText(media) : "";
  return [
    "This is a Class Interactive learning exercise.",
    "To play it, visit www.classinteractives.co.uk and use Load saved activity.",
    "Activity Link:\n" + link,
    "ActivityData:" + payload + attachment,
    "",
  ].join("\n\n");
}

export function activityFilename(input) {
  const name = Array.from(input.trim(), (character) =>
    character.charCodeAt(0) < 32 || /[<>:"/\\|?*]/.test(character) ? "-" : character
  ).join("")
    .replace(/\.txt$/i, "").replace(/[. ]+$/, "");
  if (!name) return "";
  const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;
  return (reserved.test(name) ? "_" : "") + name + ".txt";
}

export function needsLocalMedia(id, text) {
  if (id === "2" || id === "19") return text.trimEnd().split("\n").at(-1) === LOCAL_MARKER;
  if (id === "32") return text.split(/\r?\n/).some((line) => line.trim() === LOCAL_MARKER);
  return false;
}

export function hostedActivityLinks(owner, repo, branch, path, base) {
  const parts = (value) => value.split("/").map(encodeURIComponent).join("/");
  const repoPath = [owner, repo].map(encodeURIComponent).join("/");
  return [
    { label: "GitHub Raw", url: activityUrl({txt: "https://raw.githubusercontent.com/" + repoPath +
      "/refs/heads/" + parts(branch) + "/" + parts(path)}, base) },
    { label: "jsDelivr", url: activityUrl({txt: "https://cdn.jsdelivr.net/gh/" + repoPath +
      "@" + encodeURIComponent(branch) + "/" + parts(path)}, base) },
  ];
}
