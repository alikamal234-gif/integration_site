import { NextResponse } from "next/server";
import { getCurrentStaff, canManageSystem } from "@/lib/auth";
import { updateStaffAccount, deleteStaffAccount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentStaff = await getCurrentStaff(req);
    if (!currentStaff || !canManageSystem(currentStaff)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    await updateStaffAccount(id, {
      ...body,
      adminEmail: currentStaff.email,
    });

    return NextResponse.json({
      success: true,
      message: "Staff account updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update staff" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentStaff = await getCurrentStaff(req);
    if (!currentStaff || !canManageSystem(currentStaff)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deleteStaffAccount(id, currentStaff.email);

    return NextResponse.json({
      success: true,
      message: "Staff account deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete staff" },
      { status: 400 }
    );
  }
}

