import mongoose, { Schema, Document, Model } from "mongoose";

export type Role = "SUPER_ADMIN" | "ADMIN" | "GAME_MASTER";
export type GameStatus = "pending" | "in_progress" | "completed";
export type GameCategory = "TEAM" | "BOARD_TEAM" | "BOARD_SOLO";
export type EventPhase = "SETUP" | "RUNNING" | "FINAL" | "DONE";
export type ParticipationMode = "TEAM" | "SOLO";

export interface IStudent {
  _id?: string;
  fullName: string;
  year: "A1" | "A2";
  className: string;
  gender: "Male" | "Female";
  mode: ParticipationMode;
  teamId?: string | null;
}

export interface ITeam {
  _id?: string;
  name: string;
  color: string;
  clueCount: number;
  currentStationId?: string | null;
  members: IStudent[];
  totalScore?: number;
}

export interface IGame {
  _id?: string;
  gameNumber: number;
  name: string;
  category: GameCategory;
  status: GameStatus;
  inRotation: boolean; // false when frozen
  startedAt?: Date | null;
  endedAt?: Date | null;
  masterIds: string[]; // staff ids assigned
  currentTeamId?: string | null;
  assignedRound?: number;
  description: string;
  rules: string;
  iconName: string;
  location?: string;
}

export interface IClue {
  _id?: string;
  gameId: string;
  teamId?: string | null;
  content: string;
  clueIndex: number;
  awardedAt?: Date | null;
}

export interface IEventState {
  _id?: string;
  phase: EventPhase;
  currentRound: number;
  totalRounds: number;
  cluesRevealed: boolean;
  roundStartedAt?: Date | null;
  roundDurationMinutes: number;
}

export interface IStaff {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  assignedGameIds: string[];
}

export interface IAuditLog {
  _id?: string;
  adminEmail: string;
  action: string;
  details: string;
  createdAt: Date;
}

export interface IGameAssignment {
  _id?: string;
  gameId: string;
  teamId: string;
  round: number;
  status: GameStatus;
  winnerTeamId?: string | null;
}

// Mongoose Schemas (used if MongoDB connected)
const StudentSchema = new Schema<IStudent & Document>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  fullName: { type: String, required: true },
  year: { type: String, enum: ["A1", "A2"], required: true },
  className: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  mode: { type: String, enum: ["TEAM", "SOLO"], required: true },
  teamId: { type: String, default: null },
});

const TeamSchema = new Schema<ITeam & Document>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  color: { type: String, required: true },
  clueCount: { type: Number, default: 0 },
  currentStationId: { type: String, default: null },
  members: [
    {
      fullName: String,
      year: String,
      className: String,
      gender: String,
      mode: String,
    },
  ],
  totalScore: { type: Number, default: 0 },
});

const GameSchema = new Schema<IGame & Document>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  gameNumber: { type: Number, required: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ["TEAM", "BOARD_TEAM", "BOARD_SOLO"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed"],
    default: "pending",
  },
  inRotation: { type: Boolean, default: true },
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null },
  masterIds: [{ type: String }],
  currentTeamId: { type: String, default: null },
  assignedRound: { type: Number, default: 1 },
  description: { type: String, default: "" },
  rules: { type: String, default: "" },
  iconName: { type: String, default: "Trophy" },
  location: { type: String, default: "Station" },
});

const ClueSchema = new Schema<IClue & Document>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  gameId: { type: String, required: true },
  teamId: { type: String, default: null },
  content: { type: String, required: true },
  clueIndex: { type: Number, required: true },
  awardedAt: { type: Date, default: null },
});

const EventStateSchema = new Schema<IEventState & Document>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  phase: {
    type: String,
    enum: ["SETUP", "RUNNING", "FINAL", "DONE"],
    default: "SETUP",
  },
  currentRound: { type: Number, default: 1 },
  totalRounds: { type: Number, default: 9 },
  cluesRevealed: { type: Boolean, default: false },
  roundStartedAt: { type: Date, default: null },
  roundDurationMinutes: { type: Number, default: 20 },
});

const StaffSchema = new Schema<IStaff & Document>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["SUPER_ADMIN", "ADMIN", "GAME_MASTER"],
    required: true,
  },
  assignedGameIds: [{ type: String }],
});

const AuditLogSchema = new Schema<IAuditLog & Document>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  adminEmail: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const GameAssignmentSchema = new Schema<IGameAssignment & Document>({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  gameId: { type: String, required: true },
  teamId: { type: String, required: true },
  round: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed"],
    default: "pending",
  },
  winnerTeamId: { type: String, default: null },
});

export const StudentModel: Model<IStudent & Document> =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);

export const TeamModel: Model<ITeam & Document> =
  mongoose.models.Team || mongoose.model("Team", TeamSchema);

export const GameModel: Model<IGame & Document> =
  mongoose.models.Game || mongoose.model("Game", GameSchema);

export const ClueModel: Model<IClue & Document> =
  mongoose.models.Clue || mongoose.model("Clue", ClueSchema);

export const EventStateModel: Model<IEventState & Document> =
  mongoose.models.EventState || mongoose.model("EventState", EventStateSchema);

export const StaffModel: Model<IStaff & Document> =
  mongoose.models.Staff || mongoose.model("Staff", StaffSchema);

export const AuditLogModel: Model<IAuditLog & Document> =
  mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

export const GameAssignmentModel: Model<IGameAssignment & Document> =
  mongoose.models.GameAssignment ||
  mongoose.model("GameAssignment", GameAssignmentSchema);

