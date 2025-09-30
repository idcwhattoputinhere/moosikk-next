import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log(`Imposter using Legacy API - ${req.url}`);
  return new Response("Legacy API is deprecated", { status: 400 });
  // Only for study purposes, I dont mean to harm anyone with this code.

  // let quality = "128";
  // const { searchParams } = new URL(req.url);
  // const videoId = searchParams.get("id");
  // const q = searchParams.get("quality");
  // if (q == "high") {
  //   quality = "320";
  // }
  // if (!videoId) {
  //   return new Response("Missing video id", { status: 400 });
  // }

  // try {
  //   // 1. Get fresh token
  //   const tokenRes = await fetch("https://ezconv.com/api/token", {
  //     method: "POST",
  //     headers: {
  //       accept: "*/*",
  //       "content-type": "application/json",
  //       referer: `https://ezconv.com/?url=https://www.youtube.com/watch?v=${videoId}`,
  //     },
  //   });

  //   if (!tokenRes.ok) {
  //     throw new Error(`Token request failed: ${tokenRes.status}`);
  //   }

  //   const { token } = await tokenRes.json();

  //   // 2. Call conversion API
  //   const body = {
  //     url: `https://www.youtube.com/watch?v=${videoId}`,
  //     quality: quality,
  //     trim: false,
  //     startT: 0,
  //     endT: 0,
  //     token,
  //   };

  //   const convertRes = await fetch("https://ds2.ezsrv.net/api/convert", {
  //     method: "POST",
  //     headers: {
  //       "content-type": "application/json",
  //       accept: "*/*",
  //     },
  //     body: JSON.stringify(body),
  //   });

  //   if (!convertRes.ok) {
  //     throw new Error(`Convert request failed: ${convertRes.status}`);
  //   }
  //   console.log(`audio quality: ${quality} video id: ${videoId}`);
  //   const json = await convertRes.json();

  //   if (json.status !== "done" || !json.url) {
  //     throw new Error("Conversion failed or no URL returned");
  //   }

  //   // 3. Stream MP3 back
  //   // Fetch the MP3
  //   const mp3Res = await fetch(json.url);
  //   if (!mp3Res.ok) throw new Error("Failed to fetch mp3");

  //   // Read into ArrayBuffer
  //   const arrayBuffer = await mp3Res.arrayBuffer();

  //   // Return as blob-like Response
  //   return new Response(arrayBuffer, {
  //     headers: {
  //       "Content-Type": "audio/mpeg",
  //       "Content-Disposition": `inline; filename="${encodeURIComponent(json.title)}.mp3"`,
  //     },
  //   });
  // } catch (err: unknown) {
  //   console.error("Stream error:", err);
  //   return new Response("Failed to convert/stream", { status: 500 });
  // }
}
