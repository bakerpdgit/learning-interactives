export const FULL_CLIP = "end";

export function clipPlaybackUrl(source) {
  try {
    const url = new URL(source);
    const youtube = /^(?:[\w-]+\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)$/i.test(url.hostname);
    const hasVideo = url.searchParams.has("v") || /^\/(?:embed|shorts|live)\/[\w-]+/.test(url.pathname) ||
      (url.hostname === "youtu.be" && url.pathname !== "/");
    if (youtube && hasVideo && (url.searchParams.has("list") || url.searchParams.has("channel"))) {
      // ReactPlayer treats any URL with a list parameter as playlist-only.
      url.searchParams.delete("list");
      url.searchParams.delete("channel");
      url.searchParams.delete("index");
      return url.href;
    }
  } catch {
    // Let the player report an unavailable source.
  }
  return source;
}
