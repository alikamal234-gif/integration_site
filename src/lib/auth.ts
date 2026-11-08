import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { Role } from "./models";

const JWT_SECRET = process.env.JWT_SECRET || "youcode_integration_day_super_secret_jwt_key_2026_change_in_production";
const COOKIE_NAME = "youcode_staff_token";

export interface TokenPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
  assignedGameIds: string[];
}

export function signStaffToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyStaffToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentStaff(req?: Request): Promise<TokenPayload | null> {
  // 1. Check Authorization header if request passed
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const bearerToken = authHeader.substring(7).trim();
      const payload = verifyStaffToken(bearerToken);
      if (payload) return payload;
    }
  }

  // 2. Check cookies
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = verifyStaffToken(token);
      if (payload) return payload;
    }
  } catch (e) {
    // cookies() unavailable in non-request context
  }

  return null;
}

export function canManageGame(staff: TokenPayload, gameId: string): boolean {
  if (staff.role === "SUPER_ADMIN" || staff.role === "ADMIN") {
    return true;
  }
  return staff.assignedGameIds.includes(gameId);
}

export function canManageSystem(staff: TokenPayload): boolean {
  return staff.role === "SUPER_ADMIN" || staff.role === "ADMIN";
}

export function isSuperAdmin(staff: TokenPayload): boolean {
  return staff.role === "SUPER_ADMIN";
}
