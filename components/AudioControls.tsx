"use client";

import { useEffect, useRef, useState } from "react";
// Need time
export default function AudioControls({
  audioRef,
  ctxRef,
  sourceRef,
  gainRef,
  panRef,
  bassRef,
  trebleRef,
  showControl,
  setShowControl,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  showControl: boolean;
  ctxRef: React.RefObject<AudioContext | null>;
  sourceRef: React.RefObject<MediaElementAudioSourceNode | null>;
  gainRef: React.RefObject<GainNode | null>;
  panRef: React.RefObject<StereoPannerNode | null>;
  bassRef: React.RefObject<BiquadFilterNode | null>;
  trebleRef: React.RefObject<BiquadFilterNode | null>;
  setShowControl: (boolean: boolean) => void;
}) {
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [pan, setPan] = useState(0);
  const [bass, setBass] = useState(0);
  const [treble, setTreble] = useState(0);

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

  // Handlers
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

  return (
    <div className="fixed inset-0 z-41 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="p-4 w-70 rounded-xl bg-neutral-900 border border-neutral-700 space-y-3">
        <h2 className="text-lg font-bold">Audio Controls</h2>

        <label className="block">
          🎚 Volume
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
          ⏩ Speed / Pitch
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
          🎧 Stereo Pan
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
          🎵 Bass
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
            <span className="ml-2 text-sm text-neutral-200">{bass} dB</span>
          </div>
        </label>

        <label className="block">
          ✨ Treble
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
            <span className="ml-2 text-sm text-neutral-200">{treble} dB</span>
          </div>
        </label>

        <button
          onClick={() => {
            setShowControl(false);
          }}
          className="mt-6 w-full rounded-lg bg-red-600 px-3 py-2 hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
