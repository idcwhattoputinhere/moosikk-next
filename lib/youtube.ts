import { Innertube } from "youtubei.js";
let yt: Innertube | null = null;

export async function getYT() {
  if (yt) return yt;
  const cookie = process.env.YT_COOKIE;
  yt = await Innertube.create({
    // retrieve_player: true,
    // cookie,
  });
  return yt;
}

export async function pickBestAudio(formats: any[]) {
  // Prefer audio/webm with opus, fall back to m4a
  const sorted = formats
    .filter((f: any) => f.has_audio && !f.has_video)
    .sort((a: any, b: any) => (b.bitrate ?? 0) - (a.bitrate ?? 0));
  return sorted[0] ?? null;
}
