import { NextResponse } from "next/server";
import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Release from "@/models/Release";
import Order from "@/models/Order";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      reservationId,
    } = body;

    // ============================================
    // VALIDATE INPUT
    // ============================================

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !reservationId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing payment information.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // FIND RESERVATION
    // ============================================

    const reservation =
      await Reservation.findById(
        reservationId
      );

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservation not found.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // RAZORPAY ORDER ID MUST EXIST ON SERVER
    // ============================================

    const savedRazorpayOrderId =
      String(
        reservation.razorpayOrderId || ""
      );

    if (!savedRazorpayOrderId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Razorpay order is not associated with this reservation.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // IMPORTANT SECURITY CHECK
    //
    // The order ID returned by Checkout must
    // match the order ID saved on our server.
    // ============================================

    if (
      razorpay_order_id !==
      savedRazorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment order mismatch.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // RAZORPAY SECRET
    // ============================================

    const secret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Razorpay secret is not configured.",
        },
        { status: 500 }
      );
    }

    // ============================================
    // GENERATE SIGNATURE
    //
    // IMPORTANT:
    // Use order ID from OUR DATABASE.
    // ============================================

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          secret
        )
        .update(
          `${savedRazorpayOrderId}|${razorpay_payment_id}`
        )
        .digest("hex");

    // ============================================
    // TIMING-SAFE SIGNATURE COMPARISON
    // ============================================

    const receivedBuffer =
      Buffer.from(
        String(razorpay_signature),
        "utf8"
      );

    const generatedBuffer =
      Buffer.from(
        generatedSignature,
        "utf8"
      );

    if (
      receivedBuffer.length !==
      generatedBuffer.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment verification failed.",
        },
        { status: 400 }
      );
    }

    const isValid =
      crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment verification failed.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // ALREADY SECURED
    // ============================================

    if (
      reservation.status ===
      "SECURED"
    ) {
      reservation.paymentStatus =
        "Paid";

      reservation.razorpayOrderId =
        savedRazorpayOrderId;

      reservation.razorpayPaymentId =
        razorpay_payment_id;

      reservation.razorpaySignature =
        razorpay_signature;

      if (!reservation.orderStatus) {
        reservation.orderStatus =
          "Processing";
      }

      await reservation.save();

      // ------------------------------------------
      // FIND EXISTING ORDER
      // ------------------------------------------

      let existingOrder =
        await Order.findOne({
          $or: [
            {
              razorpayPaymentId:
                razorpay_payment_id,
            },

            {
              razorpayOrderId:
                savedRazorpayOrderId,
            },

            {
              reservationId:
                String(
                  reservation._id
                ),
            },
          ],
        });

      // ------------------------------------------
      // REPAIR EXISTING ORDER
      // ------------------------------------------

      if (existingOrder) {
        existingOrder.razorpayOrderId =
          savedRazorpayOrderId;

        existingOrder.razorpayPaymentId =
          razorpay_payment_id;

        existingOrder.paymentStatus =
          "Paid";

        existingOrder.paymentMethod =
          "ONLINE";

        await existingOrder.save();
      }

      return NextResponse.json({
        success: true,

        alreadySecured: true,

        message:
          "Payment already verified.",

        reservation: {
          id: String(
            reservation._id
          ),

          status:
            reservation.status,

          slotNumber:
            reservation.slotNumber,

          slotName:
            reservation.slotName,

          paymentStatus:
            reservation.paymentStatus,

          orderStatus:
            reservation.orderStatus,

          razorpayOrderId:
            reservation.razorpayOrderId,

          razorpayPaymentId:
            reservation.razorpayPaymentId,
        },

        order: existingOrder
          ? {
              id: String(
                existingOrder._id
              ),

              orderId:
                existingOrder.orderId ||
                null,

              status:
                existingOrder.orderStatus ||
                "Pending",

              paymentStatus:
                existingOrder.paymentStatus,

              razorpayOrderId:
                existingOrder.razorpayOrderId,

              razorpayPaymentId:
                existingOrder.razorpayPaymentId,
            }
          : null,
      });
    }

    // ============================================
    // RESERVATION MUST BE PENDING
    // ============================================

    if (
      reservation.status !==
      "PENDING"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This reservation is no longer pending.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // CHECK EXPIRY
    // ============================================

    if (
      reservation.expiresAt &&
      new Date(
        reservation.expiresAt
      ).getTime() <= Date.now()
    ) {
      reservation.status =
        "EXPIRED";

      await reservation.save();

      return NextResponse.json(
        {
          success: false,
          error:
            "This reservation has expired.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // FIND RELEASE
    // ============================================

    const release =
      await Release.findById(
        reservation.releaseId
      );

    if (!release) {
      return NextResponse.json(
        {
          success: false,
          error: "Release not found.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // RELEASE MUST BE LIVE
    // ============================================

    if (
      release.status !== "LIVE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This release is no longer live.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // ATOMIC SLOT ALLOCATION
    // ============================================

    const updatedRelease =
      await Release.findOneAndUpdate(
        {
          _id: release._id,

          status: "LIVE",

          $expr: {
            $lt: [
              "$securedSlots",
              "$totalSlots",
            ],
          },
        },
        {
          $inc: {
            securedSlots: 1,
          },
        },
        {
          new: true,
        }
      );

    if (!updatedRelease) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unfortunately, all slots have already been secured.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // ASSIGN SLOT
    // ============================================

    const slotNumber =
      Number(
        updatedRelease.securedSlots
      );

    const slotName =
      `HUSNAIN-${String(
        slotNumber
      ).padStart(3, "0")}`;

    // ============================================
    // UPDATE RESERVATION
    // ============================================

    reservation.status =
      "SECURED";

    reservation.slotNumber =
      slotNumber;

    reservation.slotName =
      slotName;

    reservation.paymentStatus =
      "Paid";

    reservation.orderStatus =
      "Processing";

    reservation.razorpayOrderId =
      savedRazorpayOrderId;

    reservation.razorpayPaymentId =
      razorpay_payment_id;

    reservation.razorpaySignature =
      razorpay_signature;

    await reservation.save();

    // ============================================
    // FIND EXISTING ORDER
    // ============================================

    let order =
      await Order.findOne({
        $or: [
          {
            razorpayPaymentId:
              razorpay_payment_id,
          },

          {
            razorpayOrderId:
              savedRazorpayOrderId,
          },

          {
            reservationId:
              String(
                reservation._id
              ),
          },
        ],
      });

    // ============================================
    // CREATE ORDER
    // ============================================

    if (!order) {
      const price =
        Number(
          reservation.price
        ) || Number(
          release.price
        ) || 999;

      order =
        await Order.create({
          // CUSTOMER
          customer: {
            name:
              reservation.name,

            email:
              reservation.email,

            phone:
              reservation.phone,

            address:
              reservation.address,

            city:
              reservation.city,

            state:
              reservation.state,

            pincode:
              reservation.pincode,
          },

          // ADDRESS
          address: {
            address:
              reservation.address,

            city:
              reservation.city,

            state:
              reservation.state,

            pincode:
              reservation.pincode,
          },

          // PRODUCT
          items: [
            {
              productId:
                String(
                  reservation.releaseId
                ),

              name:
                release.releaseName ||
                "Silent Yahya Release",

              image:
                "/images/clock-tower.png",

              price,

              quantity: 1,
            },
          ],

          quantity: 1,

          // PRICE
          subtotal: price,

          shipping: 0,

          total: price,

          // PAYMENT
          paymentMethod:
            "ONLINE",

          paymentStatus:
            "Paid",

          // ORDER
          orderStatus:
            "Pending",

          // RAZORPAY
          razorpayOrderId:
            savedRazorpayOrderId,

          razorpayPaymentId:
            razorpay_payment_id,

          // REFERENCES
          reservationId:
            String(
              reservation._id
            ),

          releaseId:
            String(
              reservation.releaseId
            ),
        });
    } else {
      // ==========================================
      // REPAIR EXISTING ORDER
      // ==========================================

      order.razorpayOrderId =
        savedRazorpayOrderId;

      order.razorpayPaymentId =
        razorpay_payment_id;

      order.paymentStatus =
        "Paid";

      order.paymentMethod =
        "ONLINE";

      await order.save();
    }

    // ============================================
    // REMAINING SLOTS
    // ============================================

    const remainingSlots =
      Math.max(
        Number(
          updatedRelease.totalSlots
        ) -
          Number(
            updatedRelease.securedSlots
          ),
        0
      );

    // ============================================
    // SUCCESS
    // ============================================

    return NextResponse.json({
      success: true,

      message:
        "Payment verified and slot secured.",

      reservation: {
        id: String(
          reservation._id
        ),

        status:
          reservation.status,

        slotNumber:
          reservation.slotNumber,

        slotName:
          reservation.slotName,

        paymentStatus:
          reservation.paymentStatus,

        orderStatus:
          reservation.orderStatus,

        razorpayOrderId:
          reservation.razorpayOrderId,

        razorpayPaymentId:
          reservation.razorpayPaymentId,
      },

      order: {
        id: order?._id
          ? String(order._id)
          : null,

        orderId:
          order?.orderId ||
          null,

        status:
          order?.orderStatus ||
          "Pending",

        paymentStatus:
          order?.paymentStatus ||
          "Paid",

        razorpayOrderId:
          order?.razorpayOrderId ||
          savedRazorpayOrderId,

        razorpayPaymentId:
          order?.razorpayPaymentId ||
          razorpay_payment_id,
      },

      release: {
        securedSlots:
          updatedRelease.securedSlots,

        totalSlots:
          updatedRelease.totalSlots,

        remainingSlots,
      },
    });
  } catch (error: any) {
    console.error(
      "Payment verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Payment verification failed.",
      },
      {
        status: 500,
      }
    );
  }
}