import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import bcrypt from "bcryptjs";
import { connectMongo, initializeDataStore } from "@/lib/db";
import { StaffModel } from "@/lib/models";
import { signStaffToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await initializeDataStore();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const conn = await connectMongo();
    let staffUser: any = null;

    if (conn) {
      staffUser = await StaffModel.findOne({ email: email.toLowerCase().trim() });
    } else {
      const store = (global as any).inMemoryStore;
      staffUser = store?.staff?.find(
        (s: any) => s.email.toLowerCase() === email.toLowerCase().trim()
      );
    }

    if (!staffUser) {
      return NextResponse.json(
        { success: false, error: "Invalid email or credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, staffUser.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or credentials" },
        { status: 401 }
      );
    }

    const token = signStaffToken({
      id: staffUser._id.toString(),
      name: staffUser.name,
      email: staffUser.email,
      role: staffUser.role,
      assignedGameIds: (staffUser.assignedGameIds || []).map((id: any) => id.toString()),
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: staffUser._id.toString(),
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
        assignedGameIds: staffUser.assignedGameIds || [],
      },
    });

    // Set HTTP-only cookie
    response.cookies.set("youcode_staff_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
