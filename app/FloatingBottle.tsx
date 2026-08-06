"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function FloatingBottle() {
  return (
    <motion.div
      animate={{
        y: [0, -18, 0],
        rotate: [0, 1.5, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative"
    >
      <Image
        src="/shanaya.png"
        alt="Shanaya Attar"
        width={550}
        height={900}
        priority
        className="drop-shadow-[0_0_90px_rgba(212,175,55,.45)]"
      />
    </motion.div>
  );
}