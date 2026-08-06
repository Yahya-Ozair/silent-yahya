import Link from "next/link";

export default function PaymentFailed() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050505] px-6">
      <div className="max-w-lg rounded-3xl border border-red-500/20 bg-[#111] p-10 text-center">
        <h1 className="text-5xl font-bold text-red-500">
          Payment Failed
        </h1>

        <p className="mt-6 text-gray-400">
          Your payment could not be verified.
        </p>

        <Link
          href="/checkout"
          className="mt-10 inline-block rounded-full bg-[#D4AF37] px-8 py-4 font-bold text-black"
        >
          Try Again
        </Link>
      </div>
    </main>
  );
}