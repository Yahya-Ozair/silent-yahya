"use client";

import { useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  image: string;
  price: number;
  originalPrice: number;
  stock: number;
  volume: string;
  rating: number;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
};

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [loading, setLoading] = useState(true);

 const [product, setProduct] = useState<Product | null>(null);

const [form, setForm] = useState({
  id: "",
  name: "",
  slug: "",
  description: "",
  category: "",
  image: "",
  price: "",
  originalPrice: "",
  stock: "",
  volume: "",
  rating: "",
  topNotes: "",
  heartNotes: "",
  baseNotes: "",
  featured: false,
  bestSeller: false,
  newArrival: false,
});

  useEffect(() => {
    getProduct();
  }, []);

  async function getProduct() {
  const { id } = await params;

  const res = await fetch("/api/products/get");
  const data = await res.json();

  if (!data.success) {
    setLoading(false);
    return;
  }

  const found = data.products.find(
    (item: Product) => item._id === id
  );

  if (!found) {
    setLoading(false);
    return;
  }

  setProduct(found);

  setForm({
    id: found._id,
    name: found.name,
    slug: found.slug,
    description: found.description,
    category: found.category,
    image: found.image,
    price: String(found.price),
    originalPrice: String(found.originalPrice),
    stock: String(found.stock),
    volume: found.volume,
    rating: String(found.rating),
    topNotes: found.topNotes.join(", "),
    heartNotes: found.heartNotes.join(", "),
    baseNotes: found.baseNotes.join(", "),
    featured: found.featured,
    bestSeller: found.bestSeller,
    newArrival: found.newArrival,
  });

  setLoading(false);
}

async function saveChanges() {
  try {
    setLoading(true);

    const res = await fetch("/api/products/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: form.id,
        name: form.name,
        slug: form.slug,
        description: form.description,
        category: form.category,
        image: form.image,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        stock: Number(form.stock),
        volume: form.volume,
        rating: Number(form.rating),

        topNotes: form.topNotes
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),

        heartNotes: form.heartNotes
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),

        baseNotes: form.baseNotes
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),

        featured: form.featured,
        bestSeller: form.bestSeller,
        newArrival: form.newArrival,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Product updated successfully!");
      window.location.href = "/admin/products";
    } else {
      alert(data.message || data.error || "Update failed");
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong.");
  } finally {
    setLoading(false);
  }
}

if (loading) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      Loading Product...
    </main>
  );
}

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        Product Not Found
      </main>
    );
  }

  return (
  <main className="min-h-screen bg-[#050505] p-10 text-white">
    <div className="mx-auto max-w-5xl">

      <h1 className="mb-10 text-5xl font-bold text-[#D4AF37]">
        Edit {product.name}
      </h1>

      <div className="mt-10 space-y-5">

        <input
          className="w-full rounded-xl bg-zinc-900 p-4 outline-none"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded-xl bg-zinc-900 p-4 outline-none"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) =>
            setForm({
              ...form,
              slug: e.target.value,
            })
          }
        />

        <textarea
          className="h-40 w-full rounded-xl bg-zinc-900 p-4 outline-none"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded-xl bg-zinc-900 p-4 outline-none"
          placeholder="Category"
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
            })
          }
        />

        <div className="grid grid-cols-3 gap-4">

          <input
            className="rounded-xl bg-zinc-900 p-4 outline-none"
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
          />

          <input
            className="rounded-xl bg-zinc-900 p-4 outline-none"
            placeholder="Original Price"
            value={form.originalPrice}
            onChange={(e) =>
              setForm({
                ...form,
                originalPrice: e.target.value,
              })
            }
          />

          <input
            className="rounded-xl bg-zinc-900 p-4 outline-none"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) =>
              setForm({
                ...form,
                stock: e.target.value,
              })
            }
          />

        </div>

        <div className="grid grid-cols-2 gap-4">

          <input
            className="rounded-xl bg-zinc-900 p-4 outline-none"
            placeholder="Volume"
            value={form.volume}
            onChange={(e) =>
              setForm({
                ...form,
                volume: e.target.value,
              })
            }
          />

          <input
            className="rounded-xl bg-zinc-900 p-4 outline-none"
            placeholder="Rating"
            value={form.rating}
            onChange={(e) =>
              setForm({
                ...form,
                rating: e.target.value,
              })
            }
          />

        </div>

        <input
          className="w-full rounded-xl bg-zinc-900 p-4 outline-none"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) =>
            setForm({
              ...form,
              image: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded-xl bg-zinc-900 p-4 outline-none"
          placeholder="Top Notes"
          value={form.topNotes}
          onChange={(e) =>
            setForm({
              ...form,
              topNotes: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded-xl bg-zinc-900 p-4 outline-none"
          placeholder="Heart Notes"
          value={form.heartNotes}
          onChange={(e) =>
            setForm({
              ...form,
              heartNotes: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded-xl bg-zinc-900 p-4 outline-none"
          placeholder="Base Notes"
          value={form.baseNotes}
          onChange={(e) =>
            setForm({
              ...form,
              baseNotes: e.target.value,
            })
          }
        />

        <div className="flex gap-6">

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm({
                  ...form,
                  featured: e.target.checked,
                })
              }
            />
            Featured
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.bestSeller}
              onChange={(e) =>
                setForm({
                  ...form,
                  bestSeller: e.target.checked,
                })
              }
            />
            Best Seller
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.newArrival}
              onChange={(e) =>
                setForm({
                  ...form,
                  newArrival: e.target.checked,
                })
              }
            />
            New Arrival
          </label>

        </div>

        <button
          onClick={saveChanges}
          disabled={loading}
          className="w-full rounded-xl bg-[#D4AF37] py-4 text-lg font-bold text-black"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </div>
    </main>
  );
}