"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setLoading(false);
        alert(data.message);
        return;
      }

      alert("Login Successful!");

      router.push("/account");
      router.refresh();

    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6">

      <div className="w-full max-w-md rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-10">

        <h1 className="text-center text-4xl font-bold text-[#D4AF37]">
          Welcome Back
        </h1>

        <p className="mt-3 text-center text-zinc-400">
          Login to your account
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-10 space-y-5"
        >

          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="w-full rounded-xl border border-[#D4AF37]/20 bg-black p-4 text-white outline-none focus:border-[#D4AF37]"
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            className="w-full rounded-xl border border-[#D4AF37]/20 bg-black p-4 text-white outline-none focus:border-[#D4AF37]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#D4AF37] py-4 text-lg font-bold text-black transition hover:scale-105"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="mt-8 text-center text-zinc-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-[#D4AF37]"
          >
            Register
          </Link>
        </p>

      </div>

    </main>
  );
}