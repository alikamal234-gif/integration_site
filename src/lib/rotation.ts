import { IStudent, ITeam, IGame, IGameAssignment } from "./models";
import { TEAM_NAMES, TEAM_COLORS } from "./initialData";

/**
 * Team Balancing Algorithm:
 * Balances students across Year (A1/A2), Gender (Male/Female), and Class (A, B, C, D).
 * Target team size is 6 players, allowing 5 or 7 when total count is not divisible by 6.
 */
export function balanceTeams(students: IStudent[], desiredTeamCount?: number): ITeam[] {
  const teamEligibleStudents = students.filter((s) => s.mode === "TEAM");
  const total = teamEligibleStudents.length;

  if (total === 0) return [];

  // Determine team count: default is round(total / 6), minimum 1
  const teamCount = desiredTeamCount && desiredTeamCount > 0
    ? desiredTeamCount
    : Math.max(1, Math.round(total / 6));

  // Stratify students into 4 demographic buckets to balance Year and Gender
  const buckets: { [key: string]: IStudent[] } = {
    "A1_Male": [],
    "A1_Female": [],
    "A2_Male": [],
    "A2_Female": [],
  };

  for (const s of teamEligibleStudents) {
    const key = `${s.year}_${s.gender}`;
    if (buckets[key]) {
      buckets[key].push(s);
    } else {
      buckets["A1_Male"].push(s);
    }
  }

  // Sort each bucket by className so classes are mixed evenly
  for (const key of Object.keys(buckets)) {
    buckets[key].sort((a, b) => a.className.localeCompare(b.className));
  }

  // Initialize teams
  const teams: ITeam[] = [];
  for (let i = 0; i < teamCount; i++) {
    const name = TEAM_NAMES[i % TEAM_NAMES.length] + (i >= TEAM_NAMES.length ? ` ${Math.floor(i / TEAM_NAMES.length) + 1}` : "");
    const color = TEAM_COLORS[i % TEAM_COLORS.length];
    teams.push({
      _id: `team_${i + 1}`,
      name,
      color,
      clueCount: 0,
      members: [],
      currentStationId: null,
      totalScore: 0,
    });
  }

  // Distribute bucket by bucket using serpentine distribution
  let teamPointer = 0;
  let direction = 1;

  for (const bucketKey of ["A1_Male", "A2_Female", "A1_Female", "A2_Male"]) {
    const list = buckets[bucketKey];
    for (const student of list) {
      teams[teamPointer].members.push(student);

      // Snake step
      teamPointer += direction;
      if (teamPointer >= teamCount) {
        teamPointer = teamCount - 1;
        direction = -1;
      } else if (teamPointer < 0) {
        teamPointer = 0;
        direction = 1;
      }
    }
  }

  return teams;
}

/**
 * Station Rotation Engine:
 * Generates conflict-free round-robin station rotation for all rounds.
 * Guarantees every team plays each active game exactly once across rounds.
 */
export function generateStationRotation(
  teams: ITeam[],
  games: IGame[],
  totalRounds: number = 9
): IGameAssignment[] {
  const assignments: IGameAssignment[] = [];
  const activeGames = games.filter((g) => g.category === "TEAM");

  if (teams.length === 0 || activeGames.length === 0) {
    return assignments;
  }

  const numTeams = teams.length;
  const numGames = activeGames.length;

  for (let round = 1; round <= totalRounds; round++) {
    for (let tIndex = 0; tIndex < numTeams; tIndex++) {
      const team = teams[tIndex];
      // Cyclic rotation formula: Station = (tIndex + round - 1) % numGames
      const gameIndex = (tIndex + round - 1) % numGames;
      const assignedGame = activeGames[gameIndex];

      assignments.push({
        _id: `assign_r${round}_t${tIndex}_g${gameIndex}`,
        gameId: assignedGame._id ? assignedGame._id.toString() : `game_${assignedGame.gameNumber}`,
        teamId: team._id ? team._id.toString() : `team_${tIndex + 1}`,
        round,
        status: "pending",
        winnerTeamId: null,
      });
    }
  }

  return assignments;
}

/**
 * Given current round and assignments, compute which station each team is currently at.
 */
export function getRoundStationMapping(
  round: number,
  teams: ITeam[],
  games: IGame[],
  assignments: IGameAssignment[]
): { team: ITeam; game: IGame | null; status: string; isFrozen: boolean }[] {
  const mapping: { team: ITeam; game: IGame | null; status: string; isFrozen: boolean }[] = [];

  for (const team of teams) {
    const teamAssign = assignments.find(
      (a) => a.round === round && a.teamId?.toString() === team._id?.toString()
    );

    if (!teamAssign) {
      mapping.push({
        team,
        game: null,
        status: "waiting",
        isFrozen: false,
      });
      continue;
    }

    const game = games.find((g) => g._id?.toString() === teamAssign.gameId?.toString() || `game_${g.gameNumber}` === teamAssign.gameId) || null;
    const isFrozen = game ? !game.inRotation : false;

    mapping.push({
      team,
      game,
      status: teamAssign.status,
      isFrozen,
    });
  }

  return mapping;
}

