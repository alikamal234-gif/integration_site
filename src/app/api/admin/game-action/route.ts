import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getCurrentStaff, canManageGame, canManageSystem } from "@/lib/auth";
import { connectMongo, logAudit, toggleFreezeGame } from "@/lib/db";
import {
  GameModel,
  TeamModel,
  ClueModel,
  GameAssignmentModel,
  EventStateModel,
} from "@/lib/models";

export async function POST(req: Request) {
  try {
    const staff = await getCurrentStaff(req);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { action, gameId, winnerTeamId, round } = await req.json();

    if (!gameId || !action) {
      return NextResponse.json(
        { success: false, error: "Game ID and action are required" },
        { status: 400 }
      );
    }

    if (!canManageGame(staff, gameId)) {
      return NextResponse.json(
        { success: false, error: "Permission denied: you are not assigned to this game" },
        { status: 403 }
      );
    }

    const conn = await connectMongo();
    const store = (global as any).inMemoryStore;

    let targetGame: any = null;
    let eventState: any = null;

    if (conn) {
      targetGame = await GameModel.findById(gameId);
      eventState = await EventStateModel.findOne({});
    } else if (store) {
      targetGame = store.games.find(
        (g: any) => g._id === gameId || `game_${g.gameNumber}` === gameId
      );
      eventState = store.eventState;
    }

    if (!targetGame) {
      return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 });
    }

    const currentRound = round || eventState?.currentRound || 1;

    // 1. START GAME ACTION
    if (action === "START_GAME") {
      // Guard against duplicate start clicks
      if (targetGame.status === "in_progress") {
        return NextResponse.json(
          { success: false, error: "Game is already in progress" },
          { status: 400 }
        );
      }

      const now = new Date();
      targetGame.status = "in_progress";
      targetGame.startedAt = now;
      targetGame.endedAt = null;

      if (conn) {
        await targetGame.save();
        await GameAssignmentModel.updateMany(
          { gameId: targetGame._id.toString(), round: currentRound },
          { status: "in_progress" }
        );
      } else if (store) {
        store.assignments.forEach((a: any) => {
          if ((a.gameId === gameId || a.gameId === targetGame._id) && a.round === currentRound) {
            a.status = "in_progress";
          }
        });
      }

      await logAudit(
        staff.email,
        "START_GAME",
        `Station #${targetGame.gameNumber} (${targetGame.name}) started for Round ${currentRound} by ${staff.name}`
      );

      return NextResponse.json({
        success: true,
        message: `Station started successfully`,
        game: targetGame,
      });
    }

    // 2. END GAME ACTION
    if (action === "END_GAME") {
      // Guard against duplicate end clicks or ending a pending game
      if (targetGame.status === "completed") {
        return NextResponse.json(
          { success: false, error: "Game is already completed" },
          { status: 400 }
        );
      }

      // Security check: Game Master can ONLY grant clues to the team currently playing at their game station
      if (staff.role === "GAME_MASTER" && winnerTeamId) {
        const isTeamPlayingAtStation = conn
          ? await GameAssignmentModel.findOne({
              gameId: targetGame._id.toString(),
              teamId: winnerTeamId,
              round: currentRound,
            })
          : store?.assignments.find(
              (a: any) =>
                (a.gameId === gameId || a.gameId === targetGame._id) &&
                a.teamId === winnerTeamId &&
                a.round === currentRound
            );

        if (!isTeamPlayingAtStation) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Permission denied: As a Game Master, you can only grant clues to the team currently playing your station in the active round.",
            },
            { status: 403 }
          );
        }
      }

      const now = new Date();
      targetGame.status = "completed";
      targetGame.endedAt = now;

      let awardedClueContent = "";

      // If a winner team was designated and the game is active in rotation
      if (winnerTeamId && targetGame.inRotation) {
        if (conn) {
          // Increment team's clue count
          const team = await TeamModel.findById(winnerTeamId);
          if (team) {
            team.clueCount = (team.clueCount || 0) + 1;
            team.totalScore = (team.totalScore || 0) + 100;
            await team.save();
          }

          // Assign clue to team
          let clue = await ClueModel.findOne({ gameId: targetGame._id.toString(), teamId: null });
          if (!clue) {
            clue = await ClueModel.findOne({ gameId: targetGame._id.toString() });
          }
          if (clue) {
            clue.teamId = winnerTeamId;
            clue.awardedAt = now;
            await clue.save();
            awardedClueContent = clue.content;
          }

          // Update assignment status and record winner
          await GameAssignmentModel.updateMany(
            { gameId: targetGame._id.toString(), round: currentRound },
            { status: "completed", winnerTeamId }
          );
        } else if (store) {
          const team = store.teams.find((t: any) => t._id === winnerTeamId);
          if (team) {
            team.clueCount = (team.clueCount || 0) + 1;
            team.totalScore = (team.totalScore || 0) + 100;
          }

          const clue = store.clues.find(
            (c: any) => (c.gameId === gameId || c.gameId === targetGame._id) && !c.teamId
          ) || store.clues.find(
            (c: any) => c.gameId === gameId || c.gameId === targetGame._id
          );

          if (clue) {
            clue.teamId = winnerTeamId;
            clue.awardedAt = now;
            awardedClueContent = clue.content;
          }

          store.assignments.forEach((a: any) => {
            if ((a.gameId === gameId || a.gameId === targetGame._id) && a.round === currentRound) {
              a.status = "completed";
              a.winnerTeamId = winnerTeamId;
            }
          });
        }
      } else {
        // Ending without clue award (e.g., frozen game or free play)
        if (conn) {
          await targetGame.save();
          await GameAssignmentModel.updateMany(
            { gameId: targetGame._id.toString(), round: currentRound },
            { status: "completed" }
          );
        } else if (store) {
          store.assignments.forEach((a: any) => {
            if ((a.gameId === gameId || a.gameId === targetGame._id) && a.round === currentRound) {
              a.status = "completed";
            }
          });
        }
      }

      await logAudit(
        staff.email,
        "END_GAME",
        `Station #${targetGame.gameNumber} (${targetGame.name}) completed for Round ${currentRound}. Winner: ${winnerTeamId || "None (Draw/Free Play)"}`
      );

      return NextResponse.json({
        success: true,
        message: "Match finished and result recorded",
        game: targetGame,
        awardedClue: awardedClueContent ? true : false,
      });
    }

    // 3. RESET STATUS TO PENDING (FOR GAME RETRY OR CORRECTION)
    if (action === "RESET_STATUS") {
      targetGame.status = "pending";
      targetGame.startedAt = null;
      targetGame.endedAt = null;

      if (conn) {
        await targetGame.save();
        await GameAssignmentModel.updateMany(
          { gameId: targetGame._id.toString(), round: currentRound },
          { status: "pending" }
        );
      } else if (store) {
        store.assignments.forEach((a: any) => {
          if ((a.gameId === gameId || a.gameId === targetGame._id) && a.round === currentRound) {
            a.status = "pending";
          }
        });
      }

      await logAudit(
        staff.email,
        "RESET_GAME_STATUS",
        `Station #${targetGame.gameNumber} status reset to pending for Round ${currentRound}`
      );

      return NextResponse.json({
        success: true,
        message: "Game status reset to pending",
        game: targetGame,
      });
    }

    // 4. TOGGLE FREEZE / UNFREEZE (Admin only)
    if (action === "TOGGLE_FREEZE") {
      if (!canManageSystem(staff)) {
        return NextResponse.json(
          { success: false, error: "Only Admins can freeze or unfreeze games" },
          { status: 403 }
        );
      }

      const updatedGame = await toggleFreezeGame(gameId, staff.email);
      return NextResponse.json({
        success: true,
        message: `Station ${updatedGame.name} is now ${updatedGame.inRotation ? "Unfrozen (Active)" : "Frozen (Excluded from rotation)"}`,
        game: updatedGame,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Game action error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute action" },
      { status: 500 }
    );
  }
}
