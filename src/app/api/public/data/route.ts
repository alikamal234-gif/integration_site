import { NextResponse } from "next/server";
import { getPublicDashboardData } from "@/lib/db";

export const dynamic = "force-dynamic";

// Auto-refresh endpoint polled by public screens (every 3-5 seconds)
export async function GET() {
  try {
    const data = await getPublicDashboardData();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Public data error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch public live data" },
      { status: 500 }
    );
  }
}
