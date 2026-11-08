import { IStudent, ITeam, IGame, IGameAssignment } from "./models";
import { TEAM_NAMES, TEAM_COLORS } from "./initialData";

/**
 * CSV Parser for Google Form Student Responses:
 * Handles columns: Timestamp, Full Name, Level, Class Name, Gender, Do you want to play solo or in a team?
 */
export function parseStudentCSV(csvContent: string): IStudent[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Helper to split CSV row respecting quoted cells
  const splitCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let insideQuotes = false;
    let current = "";
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        insideQuotes = !insideQuotes;
      } else if ((c === "," || c === ";") && !insideQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += c;
      }
    }
    result.push(current.trim());
    return result;
  };

  const header = splitCSVLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/["']/g, "")
  );

  // Column matching heuristics
  const nameIdx = header.findIndex(
    (h) =>
      h.includes("full name") ||
      h.includes("nom") ||
      h.includes("name") ||
      h.includes("prénom") ||
      h.includes("student")
  );
  const levelIdx = header.findIndex(
    (h) =>
      h.includes("level") ||
      h.includes("niveau") ||
      h.includes("year") ||
      h.includes("année") ||
      h.includes("promo")
  );
  const classIdx = header.findIndex(
    (h) =>
      h.includes("class") ||
      h.includes("classe") ||
      h.includes("groupe") ||
      h.includes("filière")
  );
  const genderIdx = header.findIndex(
    (h) =>
      h.includes("gender") ||
      h.includes("genre") ||
      h.includes("sexe")
  );
  const modeIdx = header.findIndex(
    (h) =>
      h.includes("solo") ||
      h.includes("team") ||
      h.includes("équipe") ||
      h.includes("play") ||
      h.includes("mode")
  );

  const students: IStudent[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = splitCSVLine(lines[i]);
    if (parts.length < 3) continue;

    const rawName =
      nameIdx !== -1 && parts[nameIdx]
        ? parts[nameIdx].replace(/["']/g, "").trim()
        : `Student ${i}`;

    const rawLevel =
      levelIdx !== -1 && parts[levelIdx] ? parts[levelIdx].toLowerCase() : "a1";

    const rawClass =
      classIdx !== -1 && parts[classIdx]
        ? parts[classIdx].replace(/["']/g, "").trim()
        : `Class ${(i % 8) + 1}`;

    const rawGender =
      genderIdx !== -1 && parts[genderIdx]
        ? parts[genderIdx].toLowerCase()
        : "male";

    const rawMode =
      modeIdx !== -1 && parts[modeIdx] ? parts[modeIdx].toLowerCase() : "team";

    // Normalize Year / Level
    let year: "A1" | "A2" = "A1";
    if (
      rawLevel.includes("2") ||
      rawLevel.includes("a2") ||
      rawLevel.includes("deuxième") ||
      rawLevel.includes("second")
    ) {
      year = "A2";
    }

    // Normalize Gender
    let gender: "Male" | "Female" = "Male";
    if (
      rawGender.startsWith("f") ||
      rawGender.includes("femme") ||
      rawGender.includes("female") ||
      rawGender.includes("fille")
    ) {
      gender = "Female";
    }

    // Normalize Mode: Solo vs Team
    const mode = rawMode.includes("solo") ? "SOLO" : "TEAM";

    students.push({
      fullName: rawName,
      year,
      className: rawClass,
      gender,
      mode,
    });
  }

  return students;
}

/**
 * Team Balancing Algorithm:
 * - Balances Year 1 (A1) and Year 2 (A2) equally (target 3:3 per team of 6).
 * - Balances Gender (Male and Female) equally (target 3:3 per team of 6).
 * - Distributes across 8 classes: preferably 1 player per class (maximum class diversity).
 * - Leftovers who cannot satisfy exact criteria are scrambled evenly across teams ("shambles").
 * - Target team size: 6 players (allows 5 or 7 when total count is not divisible by 6).
 */
export function balanceTeams(
  students: IStudent[],
  desiredTeamCount?: number
): ITeam[] {
  const teamEligibleStudents = students.filter((s) => s.mode === "TEAM");
  const total = teamEligibleStudents.length;

  if (total === 0) return [];

  // Determine team count: default is round(total / 6), minimum 1
  const teamCount =
    desiredTeamCount && desiredTeamCount > 0
      ? desiredTeamCount
      : Math.max(1, Math.round(total / 6));

  // Stratify into 4 demographic quadrants
  const quadrants: { [key: string]: IStudent[] } = {
    A1_Male: [],
    A1_Female: [],
    A2_Male: [],
    A2_Female: [],
  };

  for (const s of teamEligibleStudents) {
    const key = `${s.year}_${s.gender}`;
    if (quadrants[key]) {
      quadrants[key].push(s);
    } else {
      quadrants["A1_Male"].push(s);
    }
  }

  // Shuffle within each quadrant for randomness
  for (const q of Object.keys(quadrants)) {
    quadrants[q].sort(() => Math.random() - 0.5);
  }

  // Initialize teams
  const teams: ITeam[] = [];
  for (let i = 0; i < teamCount; i++) {
    const name =
      TEAM_NAMES[i % TEAM_NAMES.length] +
      (i >= TEAM_NAMES.length
        ? ` ${Math.floor(i / TEAM_NAMES.length) + 1}`
        : "");
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

  // Helper to pick best student from a pool for a given team:
  // Preference 1: Class not yet present in team (aiming for 1 per class out of 8)
  // Preference 2: Class with minimal count in team
  const pickBestStudent = (pool: IStudent[], team: ITeam): IStudent | null => {
    if (pool.length === 0) return null;
    const teamClasses = new Set(team.members.map((m) => m.className));

    let bestIdx = pool.findIndex((s) => !teamClasses.has(s.className));
    if (bestIdx === -1) {
      // If all classes present, pick class with lowest representation
      const classCounts: { [cls: string]: number } = {};
      team.members.forEach((m) => {
        classCounts[m.className] = (classCounts[m.className] || 0) + 1;
      });
      let minCount = Infinity;
      bestIdx = 0;
      pool.forEach((s, idx) => {
        const count = classCounts[s.className] || 0;
        if (count < minCount) {
          minCount = count;
          bestIdx = idx;
        }
      });
    }

    return pool.splice(bestIdx, 1)[0];
  };

  // Phase 1: Symmetric balanced filling across the 4 quadrants
  // Cycle order: A1_Male -> A2_Female -> A1_Female -> A2_Male
  const quadrantOrder = ["A1_Male", "A2_Female", "A1_Female", "A2_Male"];
  let qIdx = 0;
  let remainingTotal = Object.values(quadrants).reduce(
    (acc, q) => acc + q.length,
    0
  );

  while (remainingTotal > 0) {
    let assignedInRound = 0;
    for (let t = 0; t < teamCount; t++) {
      const team = teams[t];

      // If team already reached target size 6 in balanced rounds, check if other teams need filling
      if (team.members.length >= 6 && remainingTotal < teamCount) {
        continue;
      }

      let student: IStudent | null = null;
      for (let offset = 0; offset < 4; offset++) {
        const targetQ = quadrantOrder[(qIdx + offset) % 4];
        student = pickBestStudent(quadrants[targetQ], team);
        if (student) break;
      }

      if (student) {
        team.members.push(student);
        assignedInRound++;
        qIdx = (qIdx + 1) % 4;
      }
    }

    remainingTotal = Object.values(quadrants).reduce(
      (acc, q) => acc + q.length,
      0
    );
    if (assignedInRound === 0) break;
  }

  // Phase 2: Shambles - any leftover players across all quadrants are scrambled evenly
  const leftovers: IStudent[] = [];
  for (const q of Object.keys(quadrants)) {
    while (quadrants[q].length > 0) {
      const s = quadrants[q].pop();
      if (s) leftovers.push(s);
    }
  }
  leftovers.sort(() => Math.random() - 0.5);

  let teamIdx = 0;
  for (const leftover of leftovers) {
    // Distribute to the team with the smallest size first
    teams.sort((a, b) => a.members.length - b.members.length);
    teams[0].members.push(leftover);
    teamIdx++;
  }

  // Sort teams back by ID
  teams.sort((a, b) => (a._id || "").localeCompare(b._id || ""));

  return teams;
}

/**
 * Station Rotation Engine:
 * Generates conflict-free round-robin station rotation for all rounds.
 * Guarantees every team plays each active game exactly once across rounds.
 * Frozen games (inRotation === false) are excluded so teams will NOT encounter them.
 */
export function generateStationRotation(
  teams: ITeam[],
  games: IGame[],
  totalRounds: number = 9
): IGameAssignment[] {
  const assignments: IGameAssignment[] = [];
  // Exclude frozen games from the active rotation pool
  const activeGames = games.filter(
    (g) => g.category === "TEAM" && g.inRotation !== false
  );

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

