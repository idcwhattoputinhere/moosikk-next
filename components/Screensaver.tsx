"use client";
import { useIdle } from "@/lib/useIdle";

export default function Screensaver({
  track,
  on,
  playing,
}: {
  track: any | null;
  on: boolean;
  playing: boolean;
}) {
  const idle = useIdle(6000); // 6s to trigger

  if (!idle || !track || !on || !playing) return null;

  return (
    <div className="fixed h-[100%] p-5 inset-0 z-50 bg-black flex -center overflow-hidden brightness-69">
      {" "}
      {/*remove items-center justify for dvd effect */}
      <div id="dvd" className="absolute dvd-move">
        <div className="text-center">
          <img
            src={track?.thumbnail}
            alt="thumb"
            className="h-64 w-64 object-cover rounded-lg mx-auto animate-dvd-move"
          />
          <br />
          <div className="w-64 mt-2 font-bold line-clamp-2">{track?.title}</div>
          <div className="text-sm text-neutral-400">{track?.author}</div>
          {/* <br /> */}
          <div className="text-sm text-neutral-400">
            Made with 🍑 by Reyansh
          </div>
        </div>
      </div>
    </div>
  );
}
