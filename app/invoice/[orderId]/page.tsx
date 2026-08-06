"use client";
import html2pdf from "html2pdf.js";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

type Order = {
  _id: string;

  customer: {
    name: string;
    email: string;
    phone: string;
  };

  address: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };

  items: {
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];

  total: number;

  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;

  createdAt: string;
};

export default function InvoicePage() {
  const { orderId } = useParams();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }
  function downloadPDF() {
  if (!invoiceRef.current) return;

  html2pdf()
    .set({
      margin: 0.5,
      filename: `Invoice-${order?._id}.pdf`,
      image: {
        type: "jpeg",
        quality: 1,
      },
      html2canvas: {
        scale: 2,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
    })
    .from(invoiceRef.current)
    .save();
}

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Order Not Found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 py-12">

      <div
  ref={invoiceRef}
  className="mx-auto max-w-4xl rounded-3xl bg-white p-12 shadow-2xl"
>

        {/* Header */}

        <div className="border-b pb-8">

          <h1 className="text-5xl font-bold text-[#D4AF37]">
            SILENT YAHYA
          </h1>

          <p className="mt-2 tracking-[6px] text-zinc-500">
            LUXURY ATTARS
          </p>

        </div>

        {/* Invoice */}

        <div className="mt-10 flex justify-between">

          <div>

            <h2 className="text-3xl font-bold">
              Invoice
            </h2>

            <p className="mt-2">
              Order ID: {order._id}
            </p>

            <p>
              Date:
              {" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>

          </div>

          <div className="flex gap-4">

  <button
    onClick={downloadPDF}
    className="rounded-xl bg-[#D4AF37] px-6 py-3 font-bold text-black"
  >
    Download PDF
  </button>

  <button
    onClick={() => window.print()}
    className="rounded-xl border border-[#D4AF37] px-6 py-3 font-bold"
  >
    Print
  </button>

</div>

        </div>

        {/* Customer */}

        <div className="mt-10 grid gap-10 md:grid-cols-2">

          <div>

            <h3 className="text-xl font-bold">
              Customer
            </h3>

            <p className="mt-4">{order.customer.name}</p>
            <p>{order.customer.phone}</p>
            <p>{order.customer.email}</p>

          </div>

          <div>

            <h3 className="text-xl font-bold">
              Shipping Address
            </h3>

            <p className="mt-4">
              {order.address.address}
            </p>

            <p>
              {order.address.city},
              {" "}
              {order.address.state}
            </p>

            <p>{order.address.pincode}</p>

          </div>

        </div>

        {/* Products */}

        <div className="mt-12">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="py-4 text-left">
                  Product
                </th>

                <th>Qty</th>

                <th>Price</th>

                <th>Total</th>

              </tr>

            </thead>

            <tbody>

              {order.items.map((item, index) => (

                <tr
                  key={index}
                  className="border-b"
                >

                  <td className="py-5">

                    <div className="flex items-center gap-4">

                      <Image
                        src={item.image}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded-lg"
                      />

                      <span>{item.name}</span>

                    </div>

                  </td>

                  <td className="text-center">
                    {item.quantity}
                  </td>

                  <td className="text-center">
                    ₹{item.price}
                  </td>

                  <td className="text-center font-bold">
                    ₹{item.price * item.quantity}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* Footer */}

        <div className="mt-10 flex justify-end">

          <div className="w-80 space-y-3">

            <div className="flex justify-between">

              <span>Total</span>

              <span className="text-3xl font-bold text-[#D4AF37]">
                ₹{order.total}
              </span>

            </div>

            <div className="flex justify-between">

              <span>Payment</span>

              <span>{order.paymentMethod}</span>

            </div>

            <div className="flex justify-between">

              <span>Status</span>

              <span>{order.paymentStatus}</span>

            </div>

          </div>

        </div>

        <div className="mt-16 border-t pt-8 text-center text-zinc-500">

          Thank you for shopping with

          <p className="mt-2 text-xl font-bold text-[#D4AF37]">
            Silent Yahya
          </p>

        </div>

      </div>

    </main>
  );
}