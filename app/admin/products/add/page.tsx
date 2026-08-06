"use client";

import { useState } from "react";

export default function AddProductPage() {
 const [loading, setLoading] = useState(false);
const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    category: "Attar",
    image: "",
    price: "",
    originalPrice: "",
    stock: "",
    volume: "12ml",
    rating: "5",
    topNotes: "",
    heartNotes: "",
    baseNotes: "",
    featured: false,
    bestSeller: false,
    newArrival: false,
  });
  async function uploadImage(file: File) {
  try {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setForm((prev) => ({
        ...prev,
        image: data.image,
      }));
    } else {
      alert("Image upload failed");
    }
  } catch (err) {
    console.error(err);
    alert("Image upload failed");
  } finally {
    setUploading(false);
  }
}

  async function saveProduct() {
    try {
      setLoading(true);

      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,

          price: Number(form.price),
          originalPrice: Number(form.originalPrice),
          stock: Number(form.stock),
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
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Product Added Successfully");

        setForm({
          name: "",
          slug: "",
          description: "",
          category: "Attar",
          image: "",
          price: "",
          originalPrice: "",
          stock: "",
          volume: "12ml",
          rating: "5",
          topNotes: "",
          heartNotes: "",
          baseNotes: "",
          featured: false,
          bestSeller: false,
          newArrival: false,
        });
      } else {
        alert(data.error || "Failed to save product");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] py-12 px-6 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl bg-[#111] p-10">

        <h1 className="mb-10 text-4xl font-bold text-[#D4AF37]">
          Add Product
        </h1>

        <div className="space-y-5">

          <input
            className="w-full rounded-xl bg-zinc-900 p-4 outline-none"
            placeholder="Product Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="w-full rounded-xl bg-zinc-900 p-4 outline-none"
            placeholder="Slug (example: noor)"
            value={form.slug}
            onChange={(e) =>
              setForm({
                ...form,
                slug: e.target.value.toLowerCase(),
              })
            }
          />

          <textarea
            className="h-36 w-full rounded-xl bg-zinc-900 p-4 outline-none"
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

          <div className="space-y-4">

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      if (e.target.files?.[0]) {
        uploadImage(e.target.files[0]);
      }
    }}
    className="w-full rounded-xl bg-zinc-900 p-4"
  />

  {uploading && (
    <p className="text-yellow-400">
      Uploading image...
    </p>
  )}

  {form.image && (
    <>
      <img
        src={form.image}
        alt="Preview"
        className="h-48 rounded-xl object-cover"
      />

      <input
        className="w-full rounded-xl bg-zinc-900 p-4"
        value={form.image}
        readOnly
      />
    </>
  )}

</div>
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
            placeholder="Top Notes (Rose,Lemon,Saffron)"
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
            placeholder="Heart Notes (Oud,Jasmine)"
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
            placeholder="Base Notes (Amber,Musk,Sandalwood)"
            value={form.baseNotes}
            onChange={(e) =>
              setForm({
                ...form,
                baseNotes: e.target.value,
              })
            }
          />

          <div className="flex flex-wrap gap-8">

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
            onClick={saveProduct}
            disabled={loading}
            className="w-full rounded-xl bg-[#D4AF37] py-4 text-lg font-bold text-black transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Product"}
          </button>

        </div>

      </div>
    </main>
  );
}