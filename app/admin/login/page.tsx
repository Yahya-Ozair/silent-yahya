"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");

  function login() {
    if (password === "123456") {
      localStorage.setItem("admin", "true");
      window.location.href = "/admin/products";
    } else {
      alert("Wrong Password");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050505] px-6">

      <div className="w-full max-w-md rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-10">

        <h1 className="mb-2 text-center text-4xl font-bold text-[#D4AF37]">
          Silent Yahya
        </h1>

        <p className="mb-8 text-center text-zinc-400">
          Admin Login
        </p>

        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-xl bg-zinc-900 p-4 text-white outline-none"
        />

        <button
          onClick={login}
          className="w-full rounded-xl bg-[#D4AF37] py-4 font-bold text-black transition hover:opacity-90"
        >
          Login
        </button>

      </div>

    </main>
  );
}