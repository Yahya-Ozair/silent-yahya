import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Reservation from "@/models/Reservation";

export const dynamic = "force-dynamic";

/*
=====================================================
ALLOWED ORDER STATUSES
=====================================================
*/

const ALLOWED_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

type AllowedStatus =
  (typeof ALLOWED_STATUSES)[number];

/*
=====================================================
SERIALIZE ORDER
=====================================================
*/

function serializeOrder(order: any) {
  return {
    id: String(order._id),

    /*
    Custom order ID
    */
    orderId:
      order.orderId || null,

    /*
    Customer
    */
    customer: {
      name:
        order.customer?.name || "",

      email:
        order.customer?.email || "",

      phone:
        order.customer?.phone || "",
    },

    /*
    Address
    */
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
        "India",
    },

    /*
    Items
    */
    items:
      Array.isArray(order.items)
        ? order.items.map(
            (item: any) => ({
              productId:
                item.productId
                  ? String(
                      item.productId
                    )
                  : null,

              id:
                item.id
                  ? String(item.id)
                  : null,

              name:
                item.name ||
                "Product",

              image:
                item.image || null,

              price:
                Number(
                  item.price || 0
                ),

              quantity:
                Number(
                  item.quantity || 1
                ),
            })
          )
        : [],

    /*
    Totals
    */
    quantity:
      Number(order.quantity || 0),

    subtotal:
      Number(order.subtotal || 0),

    shipping:
      Number(order.shipping || 0),

    total:
      Number(order.total || 0),

    /*
    Payment
    */
    paymentMethod:
      order.paymentMethod ||
      "ONLINE",

    paymentStatus:
      order.paymentStatus ||
      "Pending",

    /*
    Order status
    */
    orderStatus:
      order.orderStatus ||
      "Pending",

    /*
    Razorpay
    */
    razorpayOrderId:
      order.razorpayOrderId ||
      null,

    razorpayPaymentId:
      order.razorpayPaymentId ||
      null,

    /*
    =============================================
    RESERVATION RELATION
    =============================================
    */

    isReservation:
      Boolean(order.isReservation),

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

    /*
    Timestamps
    */
    createdAt:
      order.createdAt || null,

    updatedAt:
      order.updatedAt || null,
  };
}

/*
=====================================================
GET /api/admin/orders
=====================================================

Loads real orders from MongoDB.

Optional:

/api/admin/orders?status=Processing

/api/admin/orders?search=Yahya
=====================================================
*/

export async function GET(
  request: Request
) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const status =
      searchParams.get("status");

    const search =
      searchParams.get("search");

    /*
    ==========================================
    BUILD QUERY
    ==========================================
    */

    const query: Record<
      string,
      any
    > = {};

    /*
    STATUS FILTER
    */

    if (
      status &&
      ALLOWED_STATUSES.includes(
        status as AllowedStatus
      )
    ) {
      query.orderStatus = status;
    }

    /*
    SEARCH
    */

    if (search?.trim()) {
      const value =
        search.trim();

      const orConditions: any[] = [
        {
          orderId: {
            $regex: value,
            $options: "i",
          },
        },

        {
          "customer.name": {
            $regex: value,
            $options: "i",
          },
        },

        {
          "customer.email": {
            $regex: value,
            $options: "i",
          },
        },

        {
          "customer.phone": {
            $regex: value,
            $options: "i",
          },
        },

        {
          razorpayPaymentId: {
            $regex: value,
            $options: "i",
          },
        },

        {
          razorpayOrderId: {
            $regex: value,
            $options: "i",
          },
        },
      ];

      /*
      ==========================================
      RESERVATION ID SEARCH
      ==========================================

      reservationId is an ObjectId, so don't
      use $regex against it.
      */

      if (
        mongoose.Types.ObjectId.isValid(
          value
        )
      ) {
        orConditions.push({
          reservationId:
            new mongoose.Types.ObjectId(
              value
            ),
        });
      }

      query.$or =
        orConditions;
    }

    /*
    ==========================================
    LOAD ORDERS
    ==========================================
    */

    const orders =
      await Order.find(query)
        .sort({
          createdAt: -1,
        })
        .lean();

    /*
    ==========================================
    RESPONSE
    ==========================================
    */

    return NextResponse.json({
      success: true,

      count:
        orders.length,

      orders:
        orders.map(
          serializeOrder
        ),
    });
  } catch (error: any) {
    console.error(
      "Admin orders GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Unable to load orders.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
=====================================================
PATCH /api/admin/orders
=====================================================

Updates:

Order.orderStatus

AND

Reservation.orderStatus

when the order contains:

Order.reservationId
=====================================================
*/

export async function PATCH(
  request: Request
) {
  try {
    await connectDB();

    /*
    ==========================================
    READ BODY
    ==========================================
    */

    const body =
      await request.json();

    const id =
      String(
        body.id ||
          body.orderId ||
          ""
      ).trim();

    const newStatus =
      String(
        body.status ||
          body.orderStatus ||
          ""
      ).trim();

    /*
    ==========================================
    VALIDATE ORDER ID
    ==========================================
    */

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

    /*
    ==========================================
    VALIDATE STATUS
    ==========================================
    */

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

    const typedStatus =
      newStatus as AllowedStatus;

    /*
    ==========================================
    FIND ORDER
    ==========================================
    */

    let order: any = null;

    /*
    First try MongoDB _id.
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
    If not found, try custom orderId.
    */

    if (!order) {
      order =
        await Order.findOne({
          orderId: id,
        });
    }

    /*
    ==========================================
    ORDER NOT FOUND
    ==========================================
    */

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
    ==========================================
    UPDATE ORDER STATUS
    ==========================================
    */

    order.orderStatus =
      typedStatus;

    await order.save();

    /*
    ==========================================
    SYNC RESERVATION
    ==========================================

    This is the important part.

    The Order stores:

    reservationId

    We use that exact ID to find the
    original Reservation.

    We DO NOT create another Reservation.

    Therefore:

    Customer Tracking ID
            =
    Reservation._id

            AND

    Order.reservationId
            =
    same Reservation._id
    */

    let reservation: any =
      null;

    let reservationUpdated =
      false;

    if (
      order.reservationId &&
      mongoose.Types.ObjectId.isValid(
        String(
          order.reservationId
        )
      )
    ) {
      const reservationId =
        String(
          order.reservationId
        );

      reservation =
        await Reservation.findById(
          reservationId
        );

      if (reservation) {
        /*
        Update ONLY orderStatus.

        Do not change reservation.status
        here because reservation.status
        controls reservation lifecycle
        such as PENDING / SECURED / EXPIRED.
        */

        reservation.orderStatus =
          typedStatus;

        await reservation.save();

        reservationUpdated =
          true;
      }
    }

    /*
    ==========================================
    RESPONSE
    ==========================================
    */

    return NextResponse.json({
      success: true,

      message:
        reservationUpdated
          ? "Order and reservation status updated successfully."
          : "Order status updated successfully.",

      order: {
        id:
          String(
            order._id
          ),

        orderId:
          order.orderId ||
          null,

        orderStatus:
          order.orderStatus,

        reservationId:
          order.reservationId
            ? String(
                order.reservationId
              )
            : null,
      },

      reservation:
        reservationUpdated &&
        reservation
          ? {
              id:
                String(
                  reservation._id
                ),

              orderStatus:
                reservation.orderStatus,
            }
          : null,
    });
  } catch (error: any) {
    console.error(
      "Admin orders PATCH error:",
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