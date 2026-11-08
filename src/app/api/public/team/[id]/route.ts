import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { connectMongo, initializeDataStore } from "@/lib/db";
import {
  TeamModel,
  GameModel,
  ClueModel,
  EventStateModel,
  GameAssignmentModel,
} from "@/lib/models";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDataStore();
    const { id } = await params;
    const conn = await connectMongo();
    const store = (global as any).inMemoryStore;

    let team: any = null;
    let eventState: any = null;
    let allGames: any[] = [];
    let assignments: any[] = [];
    let awardedClues: any[] = [];

    if (conn) {
      team = await TeamModel.findById(id).lean();
      if (!team) team = await TeamModel.findOne({ name: id }).lean();
      eventState = await EventStateModel.findOne({}).lean();
      allGames = await GameModel.find({}).lean();
      assignments = await GameAssignmentModel.find({ teamId: team?._id?.toString() }).lean();
      awardedClues = await ClueModel.find({ teamId: team?._id?.toString() }).lean();
    } else if (store) {
      team = store.teams.find((t: any) => t._id === id || t.name === id);
      eventState = store.eventState;
      allGames = store.games;
      assignments = store.assignments.filter((a: any) => a.teamId === team?._id);
      awardedClues = store.clues.filter((c: any) => c.teamId === team?._id);
    }

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
    }

    const cluesRevealed = eventState?.cluesRevealed || false;

    // Secure clue mapping: contents only shown if final reveal is activated
    const clues = awardedClues.map((c: any) => ({
      clueIndex: c.clueIndex,
      awardedAt: c.awardedAt,
      content: cluesRevealed
        ? c.content
        : "🔒 Clue content locked on server until the Organizer triggers the Final Reveal.",
      isRevealed: cluesRevealed,
    }));

    // Build the 9-round roadmap for this team
    const roadmap = assignments
      .sort((a, b) => a.round - b.round)
      .map((assign: any) => {
        const game = allGames.find((g: any) => g._id?.toString() === assign.gameId || `game_${g.gameNumber}` === assign.gameId);
        return {
          round: assign.round,
          gameId: game?._id || assign.gameId,
          gameNumber: game?.gameNumber,
          gameName: game?.name || "Transit Station",
          location: game?.location || "Campus",
          status: assign.status,
          inRotation: game?.inRotation ?? true,
          isWinner: assign.winnerTeamId === team._id?.toString(),
        };
      });

    const activeRound = eventState?.currentRound || 1;
    const currentMission = roadmap.find((r) => r.round === activeRound) || null;

    return NextResponse.json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        color: team.color,
        clueCount: team.clueCount || 0,
        members: team.members || [],
        currentMission,
        roadmap,
        clues,
        cluesRevealed,
        activeRound,
      },
    });
  } catch (error: any) {
    console.error("Team fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team data" },
      { status: 500 }
    );
  }
}
