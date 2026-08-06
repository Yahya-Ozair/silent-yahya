"use client";

import { useEffect, useState } from "react";

export default function Glow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", move);

    return () =>
      window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-0 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl"
      style={{
        left: pos.x - 140,
        top: pos.y - 140,
      }}
    />
  );
}