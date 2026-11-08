import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const staff = await getCurrentStaff(req);
  if (!staff) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ success: true, user: staff });
}
