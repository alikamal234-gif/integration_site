import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  StudentModel,
  TeamModel,
  GameModel,
  ClueModel,
  EventStateModel,
  StaffModel,
  AuditLogModel,
  GameAssignmentModel,
  IStudent,
  ITeam,
  IGame,
  IClue,
  IEventState,
  IStaff,
  IAuditLog,
  IGameAssignment,
} from "./models";
import {
  INITIAL_GAMES,
  INITIAL_CLUES_POOL,
  SAMPLE_STUDENTS,
} from "./initialData";
import { balanceTeams, generateStationRotation } from "./rotation";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/youcode_integration_platform";

interface GlobalWithMongoose {
  mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose | null> | null };
  inMemoryStore?: {
    initialized: boolean;
    students: IStudent[];
    teams: ITeam[];
    games: IGame[];
    clues: IClue[];
    eventState: IEventState;
    staff: IStaff[];
    auditLogs: IAuditLog[];
    assignments: IGameAssignment[];
  };
}

declare const global: GlobalWithMongoose;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectMongo(): Promise<typeof mongoose | null> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000, // Quick timeout so we fallback gracefully
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        return m;
      })
      .catch((err) => {
        // Fallback to in-memory store
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.conn = null;
    return null;
  }
}

// In-Memory store fallback
function getInMemoryStore() {
  if (!global.inMemoryStore) {
    global.inMemoryStore = {
      initialized: false,
      students: [],
      teams: [],
      games: [],
      clues: [],
      eventState: {
        phase: "SETUP",
        currentRound: 1,
        totalRounds: 9,
        cluesRevealed: false,
        roundStartedAt: null,
        roundDurationMinutes: 15,
      },
      staff: [],
      auditLogs: [],
      assignments: [],
    };
  }
  return global.inMemoryStore;
}

export async function initializeDataStore(forceReset: boolean = false) {
  const conn = await connectMongo();
  const store = getInMemoryStore();

  if (conn) {
    const gameCount = await GameModel.countDocuments();
    const teamCount = await TeamModel.countDocuments();
    if (gameCount === 0 || teamCount === 0 || forceReset) {
      await Promise.all([
        StudentModel.deleteMany({}),
        TeamModel.deleteMany({}),
        GameModel.deleteMany({}),
        ClueModel.deleteMany({}),
        EventStateModel.deleteMany({}),
        StaffModel.deleteMany({}),
        AuditLogModel.deleteMany({}),
        GameAssignmentModel.deleteMany({}),
      ]);

      // Seed Students
      const insertedStudents = await StudentModel.insertMany(SAMPLE_STUDENTS);

      // Seed Games
      const insertedGames = await GameModel.insertMany(INITIAL_GAMES);

      // Seed Staff
      const hashedAdminPassword = await bcrypt.hash(
        process.env.INITIAL_ADMIN_PASSWORD || "admin123",
        10
      );
      const hashedGmPassword = await bcrypt.hash("master123", 10);

      await StaffModel.insertMany([
        {
          name: "Organizer Super Admin",
          email: process.env.INITIAL_ADMIN_EMAIL || "admin@youcode.ma",
          passwordHash: hashedAdminPassword,
          role: "SUPER_ADMIN",
          assignedGameIds: [],
        },
        {
          name: "Staff Admin (Lead)",
          email: "lead@youcode.ma",
          passwordHash: hashedGmPassword,
          role: "ADMIN",
          assignedGameIds: [insertedGames[0]._id.toString()],
        },
        {
          name: "Game Master 1 (Code Names)",
          email: "gm1@youcode.ma",
          passwordHash: hashedGmPassword,
          role: "GAME_MASTER",
          assignedGameIds: [insertedGames[0]._id.toString()],
        },
        {
          name: "Game Master 2 (Toxic Waste)",
          email: "gm2@youcode.ma",
          passwordHash: hashedGmPassword,
          role: "GAME_MASTER",
          assignedGameIds: [insertedGames[1]._id.toString()],
        },
        {
          name: "Game Master 3 (Water Transfer)",
          email: "gm3@youcode.ma",
          passwordHash: hashedGmPassword,
          role: "GAME_MASTER",
          assignedGameIds: [insertedGames[2]._id.toString()],
        },
      ]);

      // Seed Teams
      const balanced = balanceTeams(insertedStudents as unknown as IStudent[], 9);
      const insertedTeams = await TeamModel.insertMany(balanced);

      // Seed Clues
      const cluesToInsert: Partial<IClue>[] = [];
      insertedGames.slice(0, 9).forEach((game, idx) => {
        cluesToInsert.push({
          gameId: game._id.toString(),
          teamId: null,
          content: INITIAL_CLUES_POOL[idx] || `Clue Fragment #${idx + 1} for Integration Day`,
          clueIndex: idx + 1,
          awardedAt: null,
        });
      });
      await ClueModel.insertMany(cluesToInsert);

      // Seed Rotation Assignments
      const assignments = generateStationRotation(
        insertedTeams as unknown as ITeam[],
        insertedGames as unknown as IGame[],
        9
      );
      await GameAssignmentModel.insertMany(assignments);

      // Seed Event State
      await EventStateModel.create({
        phase: "SETUP",
        currentRound: 1,
        totalRounds: 9,
        cluesRevealed: false,
        roundStartedAt: null,
        roundDurationMinutes: 15,
      });

      // Audit Log
      await AuditLogModel.create({
        adminEmail: "system",
        action: "INITIAL_DATABASE_SEED",
        details: "Database populated with 9 integration games, 5 board games, 9 balanced teams, and staff.",
        createdAt: new Date(),
      });
    }
  } else {
    // In-memory initialization
    if (!store.initialized || forceReset) {
      store.students = SAMPLE_STUDENTS.map((s, i) => ({ ...s, _id: `stud_${i + 1}` }));
      store.games = INITIAL_GAMES.map((g, i) => ({ ...g, _id: `game_${g.gameNumber}` }));

      const hashedAdminPassword = await bcrypt.hash("admin123", 10);
      const hashedGmPassword = await bcrypt.hash("master123", 10);

      store.staff = [
        {
          _id: "staff_super",
          name: "Organizer Super Admin",
          email: "admin@youcode.ma",
          passwordHash: hashedAdminPassword,
          role: "SUPER_ADMIN",
          assignedGameIds: [],
        },
        {
          _id: "staff_admin",
          name: "Staff Admin (Lead)",
          email: "lead@youcode.ma",
          passwordHash: hashedGmPassword,
          role: "ADMIN",
          assignedGameIds: ["game_1"],
        },
        {
          _id: "staff_gm1",
          name: "Game Master 1 (Code Names)",
          email: "gm1@youcode.ma",
          passwordHash: hashedGmPassword,
          role: "GAME_MASTER",
          assignedGameIds: ["game_1"],
        },
        {
          _id: "staff_gm2",
          name: "Game Master 2 (Toxic Waste)",
          email: "gm2@youcode.ma",
          passwordHash: hashedGmPassword,
          role: "GAME_MASTER",
          assignedGameIds: ["game_2"],
        },
        {
          _id: "staff_gm3",
          name: "Game Master 3 (Water Transfer)",
          email: "gm3@youcode.ma",
          passwordHash: hashedGmPassword,
          role: "GAME_MASTER",
          assignedGameIds: ["game_3"],
        },
      ];

      // Assign game masters to games
      store.games[0].masterIds = ["staff_gm1", "staff_admin"];
      store.games[1].masterIds = ["staff_gm2"];
      store.games[2].masterIds = ["staff_gm3"];

      // Balance teams
      store.teams = balanceTeams(store.students, 9);

      // Create Clues
      store.clues = store.games.slice(0, 9).map((g, idx) => ({
        _id: `clue_${idx + 1}`,
        gameId: g._id!,
        teamId: null,
        content: INITIAL_CLUES_POOL[idx] || `Clue Fragment #${idx + 1}`,
        clueIndex: idx + 1,
        awardedAt: null,
      }));

      // Generate rotation assignments
      store.assignments = generateStationRotation(store.teams, store.games, 9);

      store.eventState = {
        phase: "SETUP",
        currentRound: 1,
        totalRounds: 9,
        cluesRevealed: false,
        roundStartedAt: null,
        roundDurationMinutes: 15,
      };

      store.auditLogs = [
        {
          _id: "log_1",
          adminEmail: "system",
          action: "IN_MEMORY_STORE_INITIALIZED",
          details: "Initialized in-memory data store with 9 integration games, 5 board games, and 9 balanced teams.",
          createdAt: new Date(),
        },
      ];

      store.initialized = true;
    }
  }
}

// Public Safe API Data Fetchers (Clue contents STRIPPED for security!)
export async function getPublicDashboardData() {
  await initializeDataStore();
  const conn = await connectMongo();
  const store = getInMemoryStore();

  let teams: ITeam[] = [];
  let games: IGame[] = [];
  let eventState: IEventState = {
    phase: "SETUP",
    currentRound: 1,
    totalRounds: 9,
    cluesRevealed: false,
    roundStartedAt: null,
    roundDurationMinutes: 15,
  };
  let assignments: IGameAssignment[] = [];
  let soloPlayers: IStudent[] = [];

  if (conn) {
    let rawTeams = await TeamModel.find({}).lean();
    let rawGames = await GameModel.find({}).lean();

    // Auto-heal if database had an incomplete seed
    if (rawTeams.length === 0 || rawGames.length === 0) {
      await initializeDataStore(true);
      rawTeams = await TeamModel.find({}).lean();
      rawGames = await GameModel.find({}).lean();
    }

    const rawState = await EventStateModel.findOne({}).lean();
    const rawAssigns = await GameAssignmentModel.find({}).lean();
    const rawSolo = await StudentModel.find({ mode: "SOLO" }).lean();

    teams = rawTeams as unknown as ITeam[];
    games = rawGames as unknown as IGame[];
    if (rawState) eventState = rawState as unknown as IEventState;
    assignments = rawAssigns as unknown as IGameAssignment[];
    soloPlayers = rawSolo as unknown as IStudent[];
  } else {
    teams = store.teams;
    games = store.games;
    eventState = store.eventState;
    assignments = store.assignments;
    soloPlayers = store.students.filter((s) => s.mode === "SOLO");
  }

  // Calculate live rankings based on clueCount
  const rankedTeams = [...teams].sort((a, b) => {
    if (b.clueCount !== a.clueCount) return b.clueCount - a.clueCount;
    return (b.totalScore || 0) - (a.totalScore || 0);
  });

  // Current station mapping for active round
  const activeRound = eventState.currentRound || 1;
  const currentStationMappings = rankedTeams.map((team) => {
    const assign = assignments.find((a) => a.round === activeRound && a.teamId?.toString() === team._id?.toString());
    const game = assign ? games.find((g) => g._id?.toString() === assign.gameId?.toString() || `game_${g.gameNumber}` === assign.gameId) : null;
    return {
      teamId: team._id,
      teamName: team.name,
      teamColor: team.color,
      round: activeRound,
      gameId: game?._id || null,
      gameName: game?.name || "Transit / Rest Station",
      gameLocation: game?.location || "Main Campus",
      status: game?.status || "pending",
      inRotation: game?.inRotation ?? true,
      startedAt: game?.startedAt || null,
    };
  });

  return {
    teams: rankedTeams,
    games,
    eventState: {
      phase: eventState.phase,
      currentRound: eventState.currentRound,
      totalRounds: eventState.totalRounds,
      cluesRevealed: eventState.cluesRevealed,
      roundStartedAt: eventState.roundStartedAt,
      roundDurationMinutes: eventState.roundDurationMinutes,
    },
    currentStationMappings,
    soloPlayers,
  };
}

// Staff Data Fetcher (Includes Clues only if unlocked or for GM controls)
export async function getStaffDashboardData(staffEmail?: string) {
  await initializeDataStore();
  const conn = await connectMongo();
  const store = getInMemoryStore();

  let teams: ITeam[] = [];
  let games: IGame[] = [];
  let eventState: IEventState = store.eventState;
  let clues: IClue[] = [];
  let assignments: IGameAssignment[] = [];
  let staffList: IStaff[] = [];
  let auditLogs: IAuditLog[] = [];
  let students: IStudent[] = [];

  if (conn) {
    teams = (await TeamModel.find({}).lean()) as unknown as ITeam[];
    games = (await GameModel.find({}).lean()) as unknown as IGame[];
    const state = await EventStateModel.findOne({}).lean();
    if (state) eventState = state as unknown as IEventState;
    clues = (await ClueModel.find({}).lean()) as unknown as IClue[];
    assignments = (await GameAssignmentModel.find({}).lean()) as unknown as IGameAssignment[];
    staffList = (await StaffModel.find({}, { passwordHash: 0 }).lean()) as unknown as IStaff[];
    auditLogs = (await AuditLogModel.find({}).sort({ createdAt: -1 }).limit(50).lean()) as unknown as IAuditLog[];
    students = (await StudentModel.find({}).lean()) as unknown as IStudent[];
  } else {
    teams = store.teams;
    games = store.games;
    eventState = store.eventState;
    clues = store.clues;
    assignments = store.assignments;
    staffList = store.staff.map(({ passwordHash, ...rest }) => rest as unknown as IStaff);
    auditLogs = [...store.auditLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    students = store.students;
  }

  const currentUser = staffList.find((s) => s.email === staffEmail);

  return {
    currentUser,
    teams,
    games,
    eventState,
    clues, // Staff can view clues configuration
    assignments,
    staffList,
    auditLogs,
    students,
  };
}

// Log audit action
export async function logAudit(adminEmail: string, action: string, details: string) {
  const conn = await connectMongo();
  const store = getInMemoryStore();

  if (conn) {
    await AuditLogModel.create({
      adminEmail,
      action,
      details,
      createdAt: new Date(),
    });
  } else {
    store.auditLogs.unshift({
      _id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      adminEmail,
      action,
      details,
      createdAt: new Date(),
    });
  }
}
