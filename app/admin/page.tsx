"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Product = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  price: number;
  stock: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const res = await fetch("/api/products/get");
    const data = await res.json();

    if (data.success) {
      setProducts(data.products);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] p-10 text-white">

      <div className="mx-auto max-w-7xl">

        <div className="mb-10 flex items-center justify-between">

          <h1 className="text-5xl font-bold">
            Products
          </h1>

          <Link
            href="/admin/products/add"
            className="rounded-xl bg-[#D4AF37] px-6 py-3 font-bold text-black"
          >
            + Add Product
          </Link>

        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-800">

          <table className="w-full">

            <thead className="bg-zinc-900">

              <tr>

                <th className="p-5 text-left">Image</th>

                <th className="text-left">Name</th>

                <th className="text-left">Price</th>

                <th className="text-left">Stock</th>

                <th className="text-left">Category</th>

                <th className="text-left">Actions</th>

              </tr>

            </thead>

            <tbody>

              {products.map((product) => (

                <tr
                  key={product._id}
                  className="border-t border-zinc-800"
                >

                  <td className="p-5">

                    <Image
                      src={product.image}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />

                  </td>

                  <td>{product.name}</td>

                  <td>₹{product.price}</td>

                  <td>{product.stock}</td>

                  <td>{product.category}</td>

                  <td>

                    <div className="flex gap-3">

                      <button className="rounded bg-blue-600 px-4 py-2">
                        Edit
                      </button>

                      <button className="rounded bg-red-600 px-4 py-2">
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </main>
  );
}