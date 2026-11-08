import { NextResponse } from "next/server";
import { getCurrentStaff, canManageSystem } from "@/lib/auth";
import { createStaffAccount, connectMongo } from "@/lib/db";
import { StaffModel } from "@/lib/models";

export const dynamic = "force-dynamic";

// GET: List all staff accounts
export async function GET(req: Request) {
  try {
    const staff = await getCurrentStaff(req);
    if (!staff || !canManageSystem(staff)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const conn = await connectMongo();
    const store = (global as any).inMemoryStore;

    let staffList = [];
    if (conn) {
      staffList = await StaffModel.find({}, { passwordHash: 0 }).lean();
    } else if (store) {
      staffList = store.staff.map(({ passwordHash, ...rest }: any) => rest);
    }

    return NextResponse.json({ success: true, staffList });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

// POST: Admin creates a new Game Master / Staff account
// Rule: Each Game Master can only be responsible for ONE game
export async function POST(req: Request) {
  try {
    const currentStaff = await getCurrentStaff(req);
    if (!currentStaff || !canManageSystem(currentStaff)) {
      return NextResponse.json(
        { success: false, error: "Admin access required to create staff accounts" },
        { status: 403 }
      );
    }

    const { name, email, password, assignedGameId, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const targetRole = role === "ADMIN" ? "ADMIN" : "GAME_MASTER";

    // For Game Masters, an assigned game is mandatory (1 GM = 1 Game)
    if (targetRole === "GAME_MASTER" && !assignedGameId) {
      return NextResponse.json(
        { success: false, error: "Each Game Master must be assigned to exactly one game" },
        { status: 400 }
      );
    }

    const newStaff = await createStaffAccount({
      name,
      email,
      password,
      assignedGameId,
      role: targetRole,
      adminEmail: currentStaff.email,
    });

    return NextResponse.json({
      success: true,
      message: `Account created successfully for ${name}`,
      staff: {
        _id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        assignedGameId: (newStaff as any).assignedGameId,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create staff account" },
      { status: 400 }
    );
  }
}

