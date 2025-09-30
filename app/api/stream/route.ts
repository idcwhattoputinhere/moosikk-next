import { NextRequest } from "next/server";
import { getYT } from "@/lib/youtube";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("id");
  if (!videoId) {
    return new Response("Missing video id", { status: 400 });
  }

  try {
    // basic stuff
    const yt = await getYT();
    const info = await yt.getBasicInfo(videoId);
    console.log(
      `[Stream] video id: ${videoId} song name ${info.basic_info.title}`,
    );

    // const audiolink = await yt.getStreamingData(videoId, {
    //   type: "audio",
    //   quality: "bestefficiency",
    //   client: "TV",
    // });
    // let res = await fetch(audiolink.url);

    const stream = await yt.download(videoId, {
      type: "audio",
      quality: "bestefficiency",
      client: "TV_SIMPLY",
    });
    const safeTitle = (info.basic_info.title ?? "unknown").replace(
      /[^\w\s-]/g,
      "_",
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "audio/mp3",
        "Content-Disposition": `inline; filename="${encodeURIComponent(safeTitle)}.mp3"`,
        "Accept-Ranges": "bytes",
      },
    });
  } catch (err: unknown) {
    console.error("Stream error:", err);
    return new Response("Failed to convert/stream " + err, { status: 500 });
  }
}
