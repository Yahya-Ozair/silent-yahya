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

  async function deleteProduct(id: string) {
    const ok = confirm("Delete this product?");

    if (!ok) return;

    try {
      const res = await fetch("/api/products/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Product deleted successfully");

        loadProducts();
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
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
                   <img
  src={product.image}
  alt={product.name}
  className="h-16 w-16 rounded-lg object-cover"
  onError={(e) => {
    e.currentTarget.src = "/images/no-image.png";
  }}
/>
                  </td>

                  <td>{product.name}</td>

                  <td>₹{product.price}</td>

                  <td>{product.stock}</td>

                  <td>{product.category}</td>

                  <td>

                    <div className="flex gap-3">

                     <Link
  href={`/admin/products/edit/${product._id}`}
  className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-700"
>
  Edit
</Link>

                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="rounded bg-red-600 px-4 py-2 hover:bg-red-700"
                      >
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