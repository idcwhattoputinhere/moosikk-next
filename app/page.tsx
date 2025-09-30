"use client";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import Player from "@/components/Player";
import Image from "next/image";
import { toast } from "sonner";
export default function Page() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [current, setCurrent] = useState<any | null>(null);

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-3 fade-left-to-right">
        <Image
          src="/favicon.ico"
          alt="logo"
          width={60}
          height={60}
          className="rounded-full"
        />
        <h1 className="text-3xl font-bold">
          Rey&apos;s Moosikk{" "}
          <div className="text-base text-neutral-400">(In Next.js)</div>
        </h1>
      </div>
      <SearchBar onResults={setTracks} />

      <div className="grid gap-3">
        {tracks.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 rounded-xl border border-neutral-800 p-3 hover:bg-neutral-900"
          >
            {/* Play Button */}
            <button
              onClick={() => setCurrent(t)}
              className="flex items-center gap-3 flex-1 text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.thumbnail}
                alt="thumb"
                className="h-14 w-24 rounded object-cover"
              />
              <div>
                <div className="w-[40vw] sm:w-full font-semibold line-clamp-1">
                  {t.title}
                </div>
                <div className="w-[35vw] sm:w-full text-sm text-neutral-400 line-clamp-1">
                  {t.author}
                </div>
                <div className="text-sm tabular-nums text-neutral-400">
                  {t.duration}
                </div>
              </div>
            </button>

            {/* Duration */}
            {/* <div className="text-sm tabular-nums text-neutral-400">
              {t.duration}
            </div> */}

            {/* Button container with flex-col for vertical stacking */}
            <div className="flex flex-col items-center gap-2">
              {/* Download Button */}
              <a
                href={`/api/stream?id=${t.id}&quality=high`}
                download={`${t.title}.mp3`}
                onClick={(e) =>
                  toast.success("Download Started,", { icon: "🎵" })
                }
                className="rounded-lg px-2 py-1 bg-neutral-800 hover:bg-white/10 text-sm"
                aria-label="Download"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-neutral-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v12m0 0l-4-4m4 4l4-4m-9 8h10"
                  />
                </svg>
              </a>

              {/* YouTube Button (New) remove href={`https://www.youtube.com/watch?v=${t.id}`} */}
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-2 py-1 bg-neutral-800 hover:bg-white/10 text-sm"
                aria-label="YouTube Link"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Open in Youtube?", {
                    duration: 5000,
                    action: {
                      label: "Click here",
                      onClick: () => {
                        window.open(`https://www.youtube.com/watch?v=${t.id}`);
                      },
                    },
                  });
                }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.615 3.184c-3.604-.265-11.758-.265-15.363 0C.167 3.518 0 5.485 0 8.001v7.987c0 2.518.167 4.484 4.252 4.817 3.605.264 11.758.264 15.363 0 4.086-.333 4.253-2.3 4.253-4.817V8.001c0-2.517-.167-4.484-4.252-4.817zM9.544 15.545V8.455L15.908 12l-6.364 3.545z" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
      <Player track={current} onNext={() => skip(+1)} onPrev={() => skip(-1)} />
      {/* <Player
        track={current}
        onNext={() => skip(+1)}
        onPrev={() => skip(-1)}
        screensaverOn={screensaverOn}
        setScreensaverOn={setScreensaverOn}
      /> */}
    </main>
  );

  function skip(delta: number) {
    if (!current) return;
    const idx = tracks.findIndex((t) => t.id === current.id);
    const next = tracks[idx + delta];
    if (next) setCurrent(next);
  }
  // function formatDur(s?: number) {
  //   if (!s && s !== 0) return "–";
  //   const m = Math.floor(s / 60);
  //   const ss = Math.floor(s % 60)
  //     .toString()
  //     .padStart(2, "0");
  //   return `${m}:${ss}`;
  // }
}
