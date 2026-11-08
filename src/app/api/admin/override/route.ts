import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getCurrentStaff, canManageSystem } from "@/lib/auth";
import { connectMongo, logAudit, initializeDataStore } from "@/lib/db";
import {
  GameModel,
  TeamModel,
  ClueModel,
  EventStateModel,
  GameAssignmentModel,
  StudentModel,
} from "@/lib/models";
import { balanceTeams, generateStationRotation } from "@/lib/rotation";

export async function POST(req: Request) {
  try {
    const staff = await getCurrentStaff(req);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!canManageSystem(staff)) {
      return NextResponse.json(
        { success: false, error: "Admin or Super Admin permission required for overrides" },
        { status: 403 }
      );
    }

    const { overrideType, payload } = await req.json();
    const conn = await connectMongo();
    const store = (global as any).inMemoryStore;

    // 1. FREEZE / UNFREEZE A GAME
    if (overrideType === "TOGGLE_FREEZE") {
      const { gameId } = payload;
      let newInRotation = true;
      let gameName = "";

      if (conn) {
        const game = await GameModel.findById(gameId);
        if (!game) return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 });
        game.inRotation = !game.inRotation;
        newInRotation = game.inRotation;
        gameName = game.name;
        await game.save();
      } else if (store) {
        const game = store.games.find((g: any) => g._id === gameId || `game_${g.gameNumber}` === gameId);
        if (!game) return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 });
        game.inRotation = !game.inRotation;
        newInRotation = game.inRotation;
        gameName = game.name;
      }

      await logAudit(
        staff.email,
        "OVERRIDE_FREEZE_GAME",
        `Game '${gameName}' (ID: ${gameId}) rotation status changed to: ${newInRotation ? "ACTIVE (Awards Clues)" : "FROZEN (Free Play / No Clues)"}`
      );

      return NextResponse.json({
        success: true,
        message: `Game is now ${newInRotation ? "active in rotation" : "frozen (free play only)"}`,
        inRotation: newInRotation,
      });
    }

    // 2. MANUAL CLUE ADJUSTMENT (ADD / REMOVE CLUE)
    if (overrideType === "ADJUST_CLUES") {
      const { teamId, delta } = payload; // delta: +1 or -1
      let newClueCount = 0;
      let teamName = "";

      if (conn) {
        const team = await TeamModel.findById(teamId);
        if (!team) return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
        team.clueCount = Math.max(0, (team.clueCount || 0) + delta);
        newClueCount = team.clueCount;
        teamName = team.name;
        await team.save();
      } else if (store) {
        const team = store.teams.find((t: any) => t._id === teamId);
        if (!team) return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
        team.clueCount = Math.max(0, (team.clueCount || 0) + delta);
        newClueCount = team.clueCount;
        teamName = team.name;
      }

      await logAudit(
        staff.email,
        "OVERRIDE_ADJUST_CLUES",
        `Manually adjusted clues for team '${teamName}' by ${delta > 0 ? "+" + delta : delta}. New total: ${newClueCount}`
      );

      return NextResponse.json({
        success: true,
        message: `Updated team ${teamName} clues to ${newClueCount}`,
        newClueCount,
      });
    }

    // 3. FINAL REVEAL TOGGLE
    if (overrideType === "TOGGLE_FINAL_REVEAL") {
      let revealed = false;

      if (conn) {
        let state = await EventStateModel.findOne({});
        if (!state) state = await EventStateModel.create({});
        state.cluesRevealed = !state.cluesRevealed;
        if (state.cluesRevealed) state.phase = "FINAL";
        revealed = state.cluesRevealed;
        await state.save();
      } else if (store) {
        store.eventState.cluesRevealed = !store.eventState.cluesRevealed;
        if (store.eventState.cluesRevealed) store.eventState.phase = "FINAL";
        revealed = store.eventState.cluesRevealed;
      }

      await logAudit(
        staff.email,
        "OVERRIDE_FINAL_REVEAL",
        `Final clue reveal was toggled to: ${revealed ? "REVEALED TO ALL PARTICIPANTS" : "LOCKED / HIDDEN"}`
      );

      return NextResponse.json({
        success: true,
        message: revealed ? "Clues have been revealed to all teams!" : "Clues are now hidden again.",
        cluesRevealed: revealed,
      });
    }

    // 4. CHANGE ROUND
    if (overrideType === "SET_ROUND") {
      const { roundNumber } = payload;
      const targetRound = Math.max(1, Math.min(9, parseInt(roundNumber, 10) || 1));

      if (conn) {
        let state = await EventStateModel.findOne({});
        if (!state) state = await EventStateModel.create({});
        state.currentRound = targetRound;
        state.roundStartedAt = new Date();
        state.phase = "RUNNING";
        await state.save();
      } else if (store) {
        store.eventState.currentRound = targetRound;
        store.eventState.roundStartedAt = new Date();
        store.eventState.phase = "RUNNING";
      }

      await logAudit(
        staff.email,
        "OVERRIDE_SET_ROUND",
        `Admin changed active round to Round ${targetRound}`
      );

      return NextResponse.json({
        success: true,
        message: `Active round set to ${targetRound}`,
        currentRound: targetRound,
      });
    }

    // 5. REBALANCE TEAMS
    if (overrideType === "REGENERATE_TEAMS") {
      const { teamCount } = payload;

      let students: any[] = [];
      if (conn) {
        students = await StudentModel.find({}).lean();
      } else if (store) {
        students = store.students;
      }

      const newTeams = balanceTeams(students, teamCount ? parseInt(teamCount, 10) : undefined);

      let games: any[] = [];
      if (conn) {
        games = await GameModel.find({}).lean();
        await TeamModel.deleteMany({});
        await TeamModel.insertMany(newTeams);
        const newAssigns = generateStationRotation(newTeams, games, 9);
        await GameAssignmentModel.deleteMany({});
        await GameAssignmentModel.insertMany(newAssigns);
      } else if (store) {
        games = store.games;
        store.teams = newTeams;
        store.assignments = generateStationRotation(newTeams, games, 9);
      }

      await logAudit(
        staff.email,
        "OVERRIDE_REGENERATE_TEAMS",
        `Rebalanced and generated ${newTeams.length} teams with even distribution of Year (A1/A2), Gender, and Classes.`
      );

      return NextResponse.json({
        success: true,
        message: `Successfully generated ${newTeams.length} balanced teams`,
        teams: newTeams,
      });
    }

    // 6. FULL RESET DATA
    if (overrideType === "RESET_ALL") {
      await initializeDataStore(true);

      await logAudit(
        staff.email,
        "OVERRIDE_RESET_ALL",
        "Super Admin performed a complete system reset to default initial state."
      );

      return NextResponse.json({
        success: true,
        message: "System has been reset to default initial state",
      });
    }

    return NextResponse.json({ success: false, error: "Unknown override type" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin override error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute override" },
      { status: 500 }
    );
  }
}
