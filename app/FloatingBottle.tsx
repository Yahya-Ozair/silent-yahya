"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function FloatingBottle() {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
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
        alt="Shanaya"
        width={520}
        height={900}
        priority
        className="drop-shadow-[0_0_80px_rgba(212,175,55,.45)]"
      />
    </motion.div>
  );
}