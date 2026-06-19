import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/auth";

const secretKey = process.env.JWT_SECRET || "default_super_secret_key_for_development";
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  expiresAt: Date;
};

export async function encrypt(payload: Omit<SessionPayload, "expiresAt"> & { expiresAt: Date }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(payload: Omit<SessionPayload, "expiresAt">, cookieName: string = "session") {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ ...payload, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(cookieName, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(cookieName: string = "session") {
  const cookieStore = await cookies();
  const session = cookieStore.get(cookieName)?.value;
  if (!session) return null;
  
  return await decrypt(session);
}

export async function deleteSession(cookieName: string = "session") {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}
