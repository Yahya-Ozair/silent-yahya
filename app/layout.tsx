import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Silent Yahya | Luxury Attars",
  description:
    "Discover premium luxury non-alcoholic attars by Silent Yahya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-white antialiased">
        <CartProvider>
          {children}

          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={12}
            toastOptions={{
              duration: 3000,

              style: {
                background: "#111111",
                color: "#ffffff",
                border: "1px solid #D4AF37",
                borderRadius: "18px",
                padding: "16px",
                fontWeight: "600",
                boxShadow:
                  "0 10px 40px rgba(212,175,55,0.15)",
              },

              success: {
                iconTheme: {
                  primary: "#D4AF37",
                  secondary: "#000000",
                },
              },

              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#FFFFFF",
                },
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}