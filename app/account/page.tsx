"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";

type User = {
  name: string;
  email: string;
  phone: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const res = await fetch("/api/auth/me");

    const data = await res.json();

    if (!data.success) {
      router.push("/login");
      return;
    }

    setUser(data.user);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        Loading...
      </main>
    );
  }
  async function logout() {
  await fetch("/api/auth/logout", {
    method: "POST",
  });

  router.push("/login");
  router.refresh();
}

  return (
    <main className="min-h-screen bg-[#050505] p-10">

      <div className="mx-auto max-w-5xl">

        <h1 className="text-5xl font-bold text-[#D4AF37]">
          Welcome,
        </h1>

        <h2 className="mt-3 text-3xl text-white">
          {user?.name}
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">

          <div className="rounded-3xl bg-[#111] p-8">

            <h3 className="text-2xl font-bold text-[#D4AF37]">
              Profile
            </h3>

            <p className="mt-6 text-white">
              {user?.email}
            </p>

            <p className="mt-2 text-zinc-400">
              {user?.phone}
            </p>

          </div>

          <div className="rounded-3xl bg-[#111] p-8">

            <h3 className="text-2xl font-bold text-[#D4AF37]">
              Quick Links
            </h3>

            <div className="mt-6 flex flex-col gap-4">

              <Link
                href="/my-orders"
                className="rounded-xl bg-[#D4AF37] p-4 text-center font-bold text-black"
              >
                My Orders
              </Link>

              <Link
                href="/wishlist"
                className="rounded-xl border border-[#D4AF37] p-4 text-center text-white"
              >
                Wishlist
              </Link>

              <Link
                href="/track-order"
                className="rounded-xl border border-[#D4AF37] p-4 text-center text-white"
              >
                Track Order
              </Link>
              
              <button
  onClick={logout}
  className="mt-10 flex w-full items-center justify-center gap-3 rounded-full bg-red-600 py-4 font-bold text-white transition hover:bg-red-700"
>
  <LogOut size={20} />
  Logout
</button>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}