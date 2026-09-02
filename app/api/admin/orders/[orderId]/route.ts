import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

type AllowedStatus =
  (typeof ALLOWED_STATUSES)[number];

function serializeOrder(order: any) {
  return {
    id: String(order._id),

    orderId: order.orderId || null,

    customer: {
      name: order.customer?.name || "",
      email: order.customer?.email || "",
      phone: order.customer?.phone || "",
    },

    address: {
      address:
        order.address?.address ||
        order.customer?.address ||
        "",

      city:
        order.address?.city ||
        order.customer?.city ||
        "",

      state:
        order.address?.state ||
        order.customer?.state ||
        "",

      pincode:
        order.address?.pincode ||
        order.customer?.pincode ||
        "",

      country:
        order.address?.country ||
        order.customer?.country ||
        "",
    },

    items: Array.isArray(order.items)
      ? order.items.map((item: any) => ({
          id: item._id
            ? String(item._id)
            : null,

          productId: item.productId
            ? String(item.productId)
            : item.id
            ? String(item.id)
            : null,

          name:
            item.name || "Product",

          image:
            item.image || null,

          price: Number(
            item.price || 0
          ),

          quantity: Number(
            item.quantity || 1
          ),
        }))
      : [],

    quantity: Number(
      order.quantity || 0
    ),

    subtotal: Number(
      order.subtotal || 0
    ),

    shipping: Number(
      order.shipping || 0
    ),

    total: Number(
      order.total || 0
    ),

    paymentMethod:
      order.paymentMethod ||
      "ONLINE",

    paymentStatus:
      order.paymentStatus ||
      "Pending",

    orderStatus:
      order.orderStatus ||
      "Pending",

    razorpayOrderId:
      order.razorpayOrderId ||
      null,

    razorpayPaymentId:
      order.razorpayPaymentId ||
      null,

    isReservation:
      Boolean(
        order.isReservation
      ),

    reservationId:
      order.reservationId
        ? String(
            order.reservationId
          )
        : null,

    releaseId:
      order.releaseId
        ? String(order.releaseId)
        : null,

    releaseName:
      order.releaseName ||
      null,

    createdAt:
      order.createdAt || null,

    updatedAt:
      order.updatedAt || null,
  };
}

/*
|--------------------------------------------------------------------------
| GET /api/admin/orders/[orderId]
|--------------------------------------------------------------------------
*/

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      orderId: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { orderId } =
      await context.params;

    const id = decodeURIComponent(
      String(orderId || "")
    ).trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    let order = null;

    /*
     * First try MongoDB _id.
     */

    if (
      mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      order =
        await Order.findById(id);
    }

    /*
     * If not found, try custom orderId.
     */

    if (!order) {
      order =
        await Order.findOne({
          orderId: id,
        });
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      order: serializeOrder(order),
    });
  } catch (error: any) {
    console.error(
      "Admin order GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to load order.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH /api/admin/orders/[orderId]
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      orderId: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { orderId } =
      await context.params;

    const id = decodeURIComponent(
      String(orderId || "")
    ).trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const newStatus = String(
      body?.status ||
        body?.orderStatus ||
        ""
    ).trim();

    if (!newStatus) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order status is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !ALLOWED_STATUSES.includes(
        newStatus as AllowedStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid order status.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Find by MongoDB _id first.
     */

    let order = null;

    if (
      mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      order =
        await Order.findById(id);
    }

    /*
     * Then try custom orderId.
     */

    if (!order) {
      order =
        await Order.findOne({
          orderId: id,
        });
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Update using the typed value.
     *
     * This avoids the TypeScript problem
     * from assigning a plain string to
     * OrderStatus.
     */

    order.orderStatus =
      newStatus as AllowedStatus;

    await order.save();

    return NextResponse.json({
      success: true,

      message:
        "Order status updated successfully.",

      order: serializeOrder(order),
    });
  } catch (error: any) {
    console.error(
      "Admin order PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to update order status.",
      },
      {
        status: 500,
      }
    );
  }
}