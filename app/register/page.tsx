"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    setLoading(false);

    if (!data.success) {
      alert(data.message);
      return;
    }

    alert("Account Created Successfully!");

    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6">

      <div className="w-full max-w-md rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-10">

        <h1 className="text-center text-4xl font-bold text-[#D4AF37]">
          Create Account
        </h1>

        <p className="mt-3 text-center text-zinc-400">
          Join Silent Yahya
        </p>

        <form
          onSubmit={handleRegister}
          className="mt-10 space-y-5"
        >

          <input
            type="text"
            placeholder="Full Name"
            required
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="w-full rounded-xl border border-[#D4AF37]/20 bg-black p-4 text-white outline-none focus:border-[#D4AF37]"
          />

          <input
            type="email"
            placeholder="Email"
            required
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
            type="tel"
            placeholder="Phone Number"
            required
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
            className="w-full rounded-xl border border-[#D4AF37]/20 bg-black p-4 text-white outline-none focus:border-[#D4AF37]"
          />

          <input
            type="password"
            placeholder="Password"
            required
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
            {loading ? "Creating..." : "Create Account"}
          </button>

        </form>

        <p className="mt-8 text-center text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#D4AF37]"
          >
            Login
          </Link>
        </p>

      </div>

    </main>
  );
}