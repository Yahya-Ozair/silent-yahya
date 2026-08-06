"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({
  open,
  onClose,
}: Props) {
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    totalPrice,
  } = useCart();

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      {/* Drawer */}

      <div
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-md border-l border-[#D4AF37]/20 bg-[#090909] shadow-2xl transition-transform duration-500 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-[#D4AF37]/20 p-6">

          <h2 className="text-2xl font-bold text-[#D4AF37]">
            Shopping Cart
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-white/10"
          >
            <X />
          </button>

        </div>

        {/* Empty */}

        {cart.length === 0 && (

          <div className="flex h-[80%] flex-col items-center justify-center px-8 text-center">

            <ShoppingBag
              size={70}
              className="text-[#D4AF37]"
            />

            <h3 className="mt-6 text-3xl font-bold">
              Cart Empty
            </h3>

            <p className="mt-3 text-zinc-400">
              Add your favourite luxury fragrances.
            </p>

            <Link
              href="/shop"
              onClick={onClose}
              className="mt-8 rounded-full bg-[#D4AF37] px-8 py-4 font-bold text-black"
            >
              Shop Now
            </Link>

          </div>

        )}

        {/* Products */}

        {cart.length > 0 && (

          <>
            <div className="h-[70vh] overflow-y-auto p-5">

              {cart.map((item) => (

                <div
                  key={item.id}
                  className="mb-5 rounded-2xl border border-[#D4AF37]/20 bg-[#111] p-4"
                >

                  <div className="flex gap-4">

                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-xl object-contain"
                    />

                    <div className="flex-1">

                      <h3 className="font-bold">
                        {item.name}
                      </h3>

                      <p className="mt-2 text-[#D4AF37]">
                        ₹{item.price}
                      </p>

                      <div className="mt-4 flex items-center gap-3">

                        <button
                          onClick={() =>
                            decreaseQty(item.id)
                          }
                          className="rounded-full border border-[#D4AF37] p-2"
                        >
                          <Minus size={16} />
                        </button>

                        <span>
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            increaseQty(item.id)
                          }
                          className="rounded-full border border-[#D4AF37] p-2"
                        >
                          <Plus size={16} />
                        </button>

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                      className="text-red-500"
                    >
                      <Trash2 />
                    </button>

                  </div>

                </div>

              ))}

            </div>

            {/* Footer */}

            <div className="absolute bottom-0 left-0 right-0 border-t border-[#D4AF37]/20 bg-[#111] p-6">

              <div className="mb-6 flex items-center justify-between">

                <span className="text-xl">
                  Total
                </span>

                <span className="text-3xl font-bold text-[#D4AF37]">
                  ₹{totalPrice}
                </span>

              </div>

              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full rounded-full bg-[#D4AF37] py-4 text-center text-lg font-bold text-black transition hover:scale-[1.02]"
              >
                Checkout
              </Link>

            </div>

          </>
        )}

      </div>
    </>
  );
}