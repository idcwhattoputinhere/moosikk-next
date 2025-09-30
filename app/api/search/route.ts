import { NextRequest, NextResponse } from "next/server";
import yts from "yt-search";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    console.log(`[Search]: ${query}`);
    const results = await yts(query);

    // Pick only first 10 videos less than 1 hr with clean data
    const items = results.videos
      .filter((vid) => vid.duration.seconds < 4800)
      .slice(0, 10)
      .map((v) => ({
        id: v.videoId,
        title: v.title,
        author: v.author.name,
        duration: v.timestamp,
        url: v.url,
        thumbnail: v.thumbnail,
      }));

    return NextResponse.json({ items });
  } catch (err: unknown) {
    console.error("yt-search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
