"use client";

import { useEffect, useState } from "react";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const admin = localStorage.getItem("admin");

    if (admin === "true") {
      setAuthorized(true);
    } else {
      window.location.href = "/admin/login";
    }
  }, []);

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        Checking Login...
      </main>
    );
  }

  return <>{children}</>;
}