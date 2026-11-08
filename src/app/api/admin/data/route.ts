import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/auth";
import { getStaffDashboardData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const staff = await getCurrentStaff(req);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await getStaffDashboardData(staff.email);
    return NextResponse.json({ success: true, data, currentUser: staff });
  } catch (error: any) {
    console.error("Admin data fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}
