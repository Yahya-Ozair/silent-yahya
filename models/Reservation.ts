import mongoose, { Model, Schema, Types } from "mongoose";

export type ReservationStatus =
  | "PENDING"
  | "SECURED"
  | "EXPIRED"
  | "CANCELLED"
  | "CONFIRMED";

export type ReservationOrderStatus =
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Pending";

export type ReservationPaymentStatus =
  | "Pending"
  | "Paid"
  | "Failed"
  | "Refunded";

export interface IReservation {
  // ==========================================
  // RELEASE
  // ==========================================

  _id?: Types.ObjectId;
  releaseId: Types.ObjectId;

  // ==========================================
  // CUSTOMER
  // ==========================================

  name: string;
  email: string;
  phone: string;

  // ==========================================
  // DELIVERY ADDRESS
  // ==========================================

  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;

  // ==========================================
  // PRODUCT / VARIANT
  // ==========================================

  variantKey?: string;
  variantName?: string;
  variantSku?: string;

  price: number;

  // ==========================================
  // RESERVATION
  // ==========================================

  status: ReservationStatus;

  expiresAt: Date;

  // ==========================================
  // SLOT
  // ==========================================

  slotNumber?: number | null;
  slotName?: string;

  // ==========================================
  // ORDER
  // ==========================================

  orderStatus?: ReservationOrderStatus;

  // ==========================================
  // PAYMENT
  // ==========================================

  paymentStatus?: ReservationPaymentStatus;

  paymentId?: string;
  orderId?: string;

  // ==========================================
  // OLD RAZORPAY COMPATIBILITY
  // ==========================================

  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // ==========================================
  // SHIPPING
  // ==========================================

  trackingNumber?: string;

  // ==========================================
  // TIMESTAMPS
  // ==========================================

  createdAt?: Date;
  updatedAt?: Date;
}

const ReservationSchema = new Schema<IReservation>(
  {
    // ======================================
    // RELEASE
    // ======================================

    releaseId: {
      type: Schema.Types.ObjectId,
      ref: "Release",
      required: true,
      index: true,
    },

    // ======================================
    // CUSTOMER
    // ======================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================
    // DELIVERY ADDRESS
    // ======================================

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    // ======================================
    // PRODUCT / VARIANT
    // ======================================

    variantKey: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    variantName: {
      type: String,
      default: "",
      trim: true,
    },

    variantSku: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      default: 999,
    },

    // ======================================
    // RESERVATION
    // ======================================

    status: {
      type: String,
      enum: [
        "PENDING",
        "SECURED",
        "EXPIRED",
        "CANCELLED",
        "CONFIRMED",
      ],
      default: "PENDING",
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    // ======================================
    // SLOT
    // ======================================

    slotNumber: {
      type: Number,
      default: null,
    },

    slotName: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================
    // ORDER
    // ======================================

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Processing",
    },

    // ======================================
    // PAYMENT
    // ======================================

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
        "Refunded",
      ],
      default: "Pending",
    },

    paymentId: {
      type: String,
      default: "",
      trim: true,
    },

    orderId: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================
    // OLD RAZORPAY COMPATIBILITY
    // ======================================

    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },

    razorpaySignature: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================
    // SHIPPING / TRACKING
    // ======================================

    trackingNumber: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// NEXT.JS / MONGOOSE HOT RELOAD PROTECTION
// ==========================================

const Reservation: Model<IReservation> =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>(
    "Reservation",
    ReservationSchema
  );

export default Reservation;