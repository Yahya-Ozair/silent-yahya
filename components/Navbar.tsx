"use client";

import Link from "next/link";
import {
  Menu,
  X,
  ShoppingBag,
  Search,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const { cart } = useCart();

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full border-b border-[#D4AF37]/20 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          {/* Logo */}
          <Link href="/">
            <div className="cursor-pointer">
              <h1 className="text-2xl font-bold tracking-[6px] text-[#D4AF37]">
                SILENT
              </h1>

              <p className="-mt-1 text-xs tracking-[8px] text-white">
                YAHYA
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden items-center gap-10 md:flex">

            <Link
              href="/"
              className="text-sm uppercase tracking-[3px] text-white transition hover:text-[#D4AF37]"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="text-sm uppercase tracking-[3px] text-white transition hover:text-[#D4AF37]"
            >
              Shop
            </Link>

            <Link
              href="/about"
              className="text-sm uppercase tracking-[3px] text-white transition hover:text-[#D4AF37]"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-sm uppercase tracking-[3px] text-white transition hover:text-[#D4AF37]"
            >
              Contact
            </Link>

          </nav>

          {/* Desktop Icons */}
          <div className="hidden items-center gap-5 md:flex">

            <button className="text-white transition hover:text-[#D4AF37]">
              <Search size={20} />
            </button>
<Link href="/wishlist">
  <button className="text-white transition hover:text-[#D4AF37]">
    <Heart size={20} />
  </button>
</Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-white transition hover:text-[#D4AF37]"
            >
              <ShoppingBag size={22} />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-bold text-black">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="text-white md:hidden"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="border-t border-[#D4AF37]/20 bg-black md:hidden">

            <nav className="flex flex-col gap-6 px-6 py-8">

              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-white hover:text-[#D4AF37]"
              >
                Home
              </Link>

              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="text-white hover:text-[#D4AF37]"
              >
                Shop
              </Link>

              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="text-white hover:text-[#D4AF37]"
              >
                About
              </Link>

              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="text-white hover:text-[#D4AF37]"
              >
                Contact
              </Link>
              <Link
  href="/wishlist"
  onClick={() => setOpen(false)}
  className="text-white hover:text-[#D4AF37]"
>
  Wishlist
</Link>

              <button
                onClick={() => {
                  setOpen(false);
                  setCartOpen(true);
                }}
                className="flex items-center justify-between text-white hover:text-[#D4AF37]"
              >
                Cart

                {cartCount > 0 && (
                  <span className="rounded-full bg-[#D4AF37] px-2 py-1 text-xs font-bold text-black">
                    {cartCount}
                  </span>
                )}
              </button>

            </nav>

          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}