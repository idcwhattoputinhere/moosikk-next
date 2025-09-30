"use client";

import { handleError } from "@/lib/handleError";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Screensaver from "./Screensaver";
import { toast } from "sonner";
export default function Player({
  track,
  onNext,
  onPrev,
  // screensaverOn,
  // setScreensaverOn,
}: {
  track: any | null;
  onNext: () => void;
  onPrev: () => void;
  // screensaverOn: boolean;
  // setScreensaverOn: (value: boolean) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const panRef = useRef<StereoPannerNode | null>(null);
  const bassRef = useRef<BiquadFilterNode | null>(null);
  const trebleRef = useRef<BiquadFilterNode | null>(null);
  const prevId = useRef<string | null>(null);
  const [screensaverOn, setScreensaverOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showReload, setShowReload] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoNext, setAutoNext] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showControl, setShowControl] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [pan, setPan] = useState(0);
  const [bass, setBass] = useState(0);
  const [treble, setTreble] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    // Keep OS-level controls in sync
    if (
      "mediaSession" in navigator &&
      navigator.mediaSession.setPositionState
    ) {
      navigator.mediaSession.setPositionState({
        duration: a.duration || 0,
        playbackRate: a.playbackRate,
        position: a.currentTime,
      });
    }
    const onTime = () => {
      if (isNaN(a.duration)) return;
      if (isNaN(a.currentTime)) return;
      if (isNaN(a.playbackRate)) return;

      setProgress(a.currentTime);
      // if (
      //   "mediaSession" in navigator &&
      //   navigator.mediaSession.setPositionState
      // ) {
      //   navigator.mediaSession.setPositionState({
      //     duration: a.duration,
      //     playbackRate: a.playbackRate,
      //     position: a.currentTime,
      //   });
      // }
    };
    const onDur = () => setDuration(a.duration || 0);
    const onEnd = () => {
      if (autoNext) onNext();
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("durationchange", onDur);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("durationchange", onDur);
      a.removeEventListener("ended", onEnd);
    };
  }, [onNext, autoNext]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track) return;

    if (prevId.current === track.id) return; // skip if same track, fixes "searching makes song restart"
    prevId.current = track.id;
    if (track) {
      (async () => {
        setLoading(true);
        const res = await fetch(`/api/stream?id=${track.id}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        a.src = url;
        a.load();
        await a.play().catch((err) => {
          console.log(err);
          handleError(err);
        });
        if (ctxRef.current?.state === "suspended") {
          ctxRef.current.resume();
        }
        if (a.duration) {
          setPlaying(true);
        }
        setLoading(false);
        // Setup MediaSession metadata
        if ("mediaSession" in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.author,
            artwork: [
              { src: track.thumbnail, sizes: "512x512", type: "image/png" },
            ],
          });

          navigator.mediaSession.setActionHandler("play", () => {
            a.play();
            setPlaying(true);
          });
          navigator.mediaSession.setActionHandler("pause", () => {
            a.pause();
            setPlaying(false);
          });
          navigator.mediaSession.setActionHandler("previoustrack", onPrev);
          navigator.mediaSession.setActionHandler("nexttrack", onNext);
          navigator.mediaSession.setActionHandler("seekto", (details: any) => {
            if (details.seekTime !== undefined) {
              a.currentTime = details.seekTime;
              setProgress(details.seekTime);
            }
          });
        }
      })();
    } else {
      a.pause();
      setPlaying(false);
    }
  }, [track, onNext, onPrev]);

  function toggle() {
    const a = audioRef.current;
    if (!a?.duration) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
      // mediaSession.playbackState = "playing";
      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "playing";
      }
    } else {
      a.pause();
      setPlaying(false);
      // mediaSession.playbackState = "paused";
      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
      }
    }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const a = audioRef.current;
    if (!a) return;
    const t = Number(e.target.value);
    a.currentTime = t;
    setProgress(t);
  }
  // Better use AudioContext I guess
  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  function handleRate(e: React.ChangeEvent<HTMLSelectElement>) {
    const r = Number(e.target.value);
    setRate(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  }
  // AudioContext setup
  useEffect(() => {
    if (!audioRef.current) return;

    if (!ctxRef.current) {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceRef.current = source;

      const gain = ctx.createGain();
      gainRef.current = gain;

      const panner = ctx.createStereoPanner();
      panRef.current = panner;

      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = "lowshelf";
      bassRef.current = bassFilter;

      const trebleFilter = ctx.createBiquadFilter();
      trebleFilter.type = "highshelf";
      trebleRef.current = trebleFilter;

      // Connect chain: source -> bass -> treble -> pan -> gain -> destination
      source
        .connect(bassFilter)
        .connect(trebleFilter)
        .connect(panner)
        .connect(gain)
        .connect(ctx.destination);
    }
  }, [audioRef]);

  // Handlers for AudioContext
  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    if (panRef.current) panRef.current.pan.value = pan;
  }, [pan]);

  useEffect(() => {
    if (bassRef.current) bassRef.current.gain.value = bass;
  }, [bass]);

  useEffect(() => {
    if (trebleRef.current) trebleRef.current.gain.value = treble;
  }, [treble]);

  // Reload if taking too long to play
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (loading) {
      timer = setTimeout(() => {
        setShowReload(true);
        setTimeout(() => {
          toast.warning(
            "It's definately your poor network... duh, wait lil more ",
          );
        }, 1500);
      }, 8000); // 8s
    } else {
      setShowReload(false);
      if (timer) clearTimeout(timer);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);

  // Final player bar
  return (
    <div className="sticky bottom-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 backdrop-blur fade-in">
      {loading && (
        <div className="fixed inset-0 z-50 flex rounded-2xl items-center justify-center bg-black/70">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-4 border-white/20 border-t-white"></div>
        </div>
      )}
      {showReload && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 text-white">
          <p className="mb-4 text-lg">Taking too long? Check Network or</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-red-600 px-4 py-2 font-semibold hover:bg-red-700"
          >
            Reload Site
          </button>
        </div>
      )}
      <audio
        ref={audioRef}
        onError={(e) => handleError(e)}
        onEnded={(e) => setPlaying(false)}
        preload="metadata"
      />
      {/* Song info */}
      <div className="mb-2">
        <div className="text-center font-semibold line-clamp-1">
          {track?.title ?? "Nothing playing"}
        </div>
        <div className="text-center text-sm text-neutral-400 line-clamp-1">
          {track?.author ?? "—"}
        </div>
        <div className="text-center tabular-nums text-sm text-neutral-400">
          {" "}
          {/* remove w-20 */}
          {fmt(progress)} / {fmt(duration)}
        </div>
      </div>
      <div className="flex justify-center items-center gap-3">
        <div className="flex items-center gap-2">
          {/* <button
            onClick={() => setAutoNext(!autoNext)}
            className={`rounded-lg px-3 py-2 ${
              autoNext ? "bg-green-800" : "bg-red-800"
            }`}
          >
            {autoNext ? "AutoNext" : "AutoNext"}
          </button> */}
          <button
            onClick={() => setShowControl(!showControl)}
            className="rounded-lg px-2 py-2 bg-neutral-800 hover:bg-white/10"
            aria-label="Audio Controls"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 12h2v6H4zM9 8h2v10H9zM14 6h2v12h-2zM19 10h2v8h-2z"
              />
            </svg>
          </button>
          <button
            onClick={onPrev}
            className="rounded-lg px-2 py-2 bg-neutral-800 hover:bg-white/10"
            aria-label="Previous"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 6l-8.5 6L18 18V6zM6 6h2v12H6z" />
            </svg>
          </button>
          <button
            onClick={toggle}
            className="rounded-lg px-4 py-2 bg-neutral-800 hover:bg-white/10"
            aria-label="Play/Pause"
          >
            {playing ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={onNext}
            className="rounded-lg px-2 py-2 bg-neutral-800 hover:bg-white/10"
            aria-label="Next"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" />
            </svg>
          </button>
          {/* <button
            onClick={() => setScreensaverOn(!screensaverOn)}
            className={`rounded-lg px-3 py-2 ${
              screensaverOn ? "bg-green-800" : "bg-red-800"
            }`}
          >
            {screensaverOn ? "Dimmer" : "Dimmer"}
          </button> */}
          {/* Settings button to open panel */}
          <button
            onClick={() => setShowPanel(true)}
            className="ml-auto rounded-lg px-2 py-2 bg-neutral-800 hover:bg-white/10"
            aria-label="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.09-.72-1.71-.96l-.37-2.65c-.06-.24-.28-.42-.5-.42h-4c-.27 0-.48.18-.5.42l-.37 2.65c-.62.24-1.19.56-1.71.96l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.09.72 1.71.96l.37 2.65c.06.24.28.42.5.42h4c.27 0 .48-.18.5-.42l.37-2.65c.62-.24 1.19-.56 1.71-.96l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={progress}
          onChange={seek}
          className="w-full accent-gray-500 h-[4px] cursor-pointer bg-transparent"
          aria-label="Seek"
        />
      </div>
      {/* Audio Controls */}
      {showControl &&
        createPortal(
          <div className="fixed inset-0 z-41 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="p-4 w-70 rounded-xl bg-neutral-900 border border-neutral-700 space-y-3">
              <h2 className="text-center text-lg font-bold">Audio Controls</h2>

              <label className="block">
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5L6 9H2v6h4l5 4V5zM15 9a5 5 0 010 6m2 2a9 9 0 000-10"
                    />
                  </svg>
                  Volume
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">0</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-neutral-400">1</span>
                  <span className="ml-2 text-sm text-neutral-200">
                    {volume.toFixed(2)}
                  </span>
                </div>
              </label>

              <label className="block">
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 inline-block mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Speed
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">0.5</span>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-neutral-400">2</span>
                  <span className="ml-2 text-sm text-neutral-200">
                    {rate.toFixed(1)}x
                  </span>
                </div>
              </label>

              <label className="block">
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 inline-block mr-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <line x1="3" y1="12" x2="9" y2="12" />
                    <line x1="15" y1="12" x2="21" y2="12" />
                  </svg>
                  Stereo Pan
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">-1</span>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.1}
                    value={pan}
                    onChange={(e) => setPan(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-neutral-400">1</span>
                  <span className="ml-2 text-sm text-neutral-200">
                    {pan.toFixed(1)}
                  </span>
                </div>
              </label>

              <label className="block">
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 inline-block mr-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                  Bass
                </div>{" "}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">-15</span>
                  <input
                    type="range"
                    min={-15}
                    max={15}
                    step={1}
                    value={bass}
                    onChange={(e) => setBass(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-neutral-400">15</span>
                  <span className="ml-2 text-sm text-neutral-200">
                    {bass}dB
                  </span>
                </div>
              </label>

              <label className="block">
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 inline-block mr-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v18m-6-6h12"
                    />
                  </svg>
                  Treble
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">-15</span>
                  <input
                    type="range"
                    min={-15}
                    max={15}
                    step={1}
                    value={treble}
                    onChange={(e) => setTreble(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-neutral-400">15</span>
                  <span className="ml-2 text-sm text-neutral-200">
                    {treble}dB
                  </span>
                </div>
              </label>

              <p className="text-xs text-neutral-400 text-center">
                P.S. Reduce volume to ~50% before using bass/treble controls to
                avoid earrape ^-^
              </p>
              <button
                onClick={() => {
                  setShowControl(false);
                }}
                className="mt-0 w-full rounded-lg bg-red-600 px-3 py-2 hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>,
          document.body,
        )}
      {/* Basic Controls (??) */}
      {showPanel &&
        createPortal(
          <div className="fixed inset-0 z-41 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="rounded-2xl bg-neutral-900 p-6 w-60 text-center shadow-xl">
              <h2 className="text-lg font-semibold mb-4">Player Controls</h2>

              {/* Toggles */}
              <div className="space-y-2">
                <button
                  onClick={() => setAutoNext(!autoNext)}
                  className="w-full rounded-lg px-3 py-2 bg-neutral-800 hover:bg-white/10"
                >
                  {autoNext ? "✅ AutoNext On" : "❌ AutoNext Off"}
                  <div className="text-xs text-neutral-400">
                    (AutoPlay's Next Song in List)
                  </div>
                </button>

                <button
                  onClick={() => setScreensaverOn(!screensaverOn)}
                  className="w-full rounded-lg px-3 py-2 bg-neutral-800 hover:bg-white/10"
                >
                  {screensaverOn ? "🌙 Dimmer ON" : "☀️ Dimmer OFF"}{" "}
                  <div className="text-xs text-neutral-400">(DVD Effect)</div>
                </button>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="mt-6 w-full rounded-lg bg-red-600 px-3 py-2 hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>,
          document.body,
        )}
      {/* Screensaver Portal */}
      {playing &&
        createPortal(
          <Screensaver track={track} on={screensaverOn} playing={playing} />,
          document.body,
        )}
    </div>
  );

  function fmt(s?: number) {
    if (!s && s !== 0) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${ss}`;
  }
}
