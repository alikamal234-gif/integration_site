import { NextResponse } from "next/server";
import { getCurrentStaff, canManageSystem } from "@/lib/auth";
import { importStudentsAndBalance } from "@/lib/db";
import { parseStudentCSV, balanceTeams } from "@/lib/rotation";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const currentStaff = await getCurrentStaff(req);
    if (!currentStaff || !canManageSystem(currentStaff)) {
      return NextResponse.json(
        { success: false, error: "Admin access required to import students and balance teams" },
        { status: 403 }
      );
    }

    const { csvContent, previewOnly, desiredTeamCount } = await req.json();

    if (!csvContent || typeof csvContent !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid CSV content is required" },
        { status: 400 }
      );
    }

    const parsedStudents = parseStudentCSV(csvContent);
    if (parsedStudents.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No valid student records could be parsed. Check that the CSV has headers like Full Name, Level, Class Name, Gender, Solo/Team.",
        },
        { status: 400 }
      );
    }

    // If preview only, run dry-run balancing without saving to database
    if (previewOnly) {
      const balanced = balanceTeams(parsedStudents, desiredTeamCount || 9);
      const soloPlayers = parsedStudents.filter((s) => s.mode === "SOLO");

      // Compute statistics
      const stats = {
        totalRows: parsedStudents.length,
        teamCandidates: parsedStudents.filter((s) => s.mode === "TEAM").length,
        soloCount: soloPlayers.length,
        teamCount: balanced.length,
        teams: balanced.map((t) => {
          const a1 = t.members.filter((m) => m.year === "A1").length;
          const a2 = t.members.filter((m) => m.year === "A2").length;
          const male = t.members.filter((m) => m.gender === "Male").length;
          const female = t.members.filter((m) => m.gender === "Female").length;
          const distinctClasses = new Set(t.members.map((m) => m.className)).size;
          return {
            name: t.name,
            color: t.color,
            memberCount: t.members.length,
            a1Count: a1,
            a2Count: a2,
            maleCount: male,
            femaleCount: female,
            distinctClasses,
            members: t.members,
          };
        }),
      };

      return NextResponse.json({ success: true, preview: true, stats });
    }

    // Full commit: save students, teams, and rotation to database
    const result = await importStudentsAndBalance(
      csvContent,
      currentStaff.email,
      desiredTeamCount || 9
    );

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${result.totalStudents} students and generated ${result.teamsCount} balanced teams.`,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process student CSV" },
      { status: 500 }
    );
  }
}

