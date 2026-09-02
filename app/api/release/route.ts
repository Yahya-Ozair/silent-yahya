import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Release from "@/models/Release";

const DEFAULT_RELEASE = {
  status: "DRAFT",
  totalSlots: 50,
  securedSlots: 0,
  releaseName: "HUSNAINS EDITION",
  price: 999,
  launchAt: "",
  releasedAt: null,
};

export async function GET() {
  try {
    await connectDB();

    let release = await Release.findOne();

    if (!release) {
      release = await Release.create(DEFAULT_RELEASE);
    }

    return NextResponse.json({
      success: true,
      release,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    let release = await Release.findOne();

    if (!release) {
      release = await Release.create({
        ...DEFAULT_RELEASE,
        ...body,
      });
    } else {
      release = await Release.findByIdAndUpdate(
        release._id,
        body,
        {
          new: true,
          runValidators: true,
        }
      );
    }

    return NextResponse.json({
      success: true,
      release,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}