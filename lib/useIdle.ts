import { useEffect, useState } from "react";

export function useIdle(timeout = 30000) {
  // 30s default
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const reset = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), timeout);
    };

    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("touchstart", reset);

    reset(); // start timer
    return () => {
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("touchstart", reset);
      clearTimeout(timer);
    };
  }, [timeout]);

  return idle;
}
