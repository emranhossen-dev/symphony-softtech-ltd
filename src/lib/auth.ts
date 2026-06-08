import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export interface JWTPayload {
  id: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | "MENTOR" | "STUDENT";
  name: string;
  iat?: number;
  exp?: number;
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
  }
}

/* ---------------- PASSWORD ---------------- */

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/* ---------------- JWT ---------------- */

export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    throw new AuthError("Invalid or expired token", 401);
  }
}

/* ---------------- COOKIE AUTH ---------------- */

export async function getAuthToken(request?: Request): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (token) {
    return token;
  }

  // If no cookie, check Authorization header from request
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
  }

  throw new AuthError("Not authenticated", 401);
}

export async function getAuthenticatedUser(request?: Request): Promise<JWTPayload> {
  const token = await getAuthToken(request);
  return verifyToken(token);
}

/* ---------------- USER AUTH ---------------- */

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AuthError("Invalid credentials", 401);
  }

  if (!user.isActive) {
    throw new AuthError("Account is deactivated", 401);
  }

  const validPassword = await comparePassword(password, user.password);

  if (!validPassword) {
    throw new AuthError("Invalid credentials", 401);
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}

/* ---------------- GET USER FROM TOKEN ---------------- */

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AuthError("User not found", 401);
  }

  if (!user.isActive) {
    throw new AuthError("Account is deactivated", 401);
  }

  return user;
}

/* ---------------- ROLE CHECK ---------------- */

export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    STUDENT: 0,
    MENTOR: 1,
    EMPLOYEE: 2,
    ADMIN: 3,
  };

  return (
    roleHierarchy[userRole as keyof typeof roleHierarchy] >=
    roleHierarchy[requiredRole as keyof typeof roleHierarchy]
  );
}

export function hasAnyRole(userRole: string, roles: string[]): boolean {
  return roles.includes(userRole);
}

/* ---------------- CREATE USER ---------------- */

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: "ADMIN" | "EMPLOYEE" | "MENTOR" | "STUDENT";
  phone?: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AuthError("User already exists", 400);
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}

/* ---------------- AUTO CREATE STUDENT ---------------- */

export async function createStudentUser(data: {
  fullName: string;
  email: string;
  phoneNumber: string;
}) {
  const tempPassword =
    Math.random().toString(36).slice(-8) +
    Math.random().toString(36).slice(-8);

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  const hashedPassword = await hashPassword(tempPassword);

  if (existingUser) {
    // Update existing user's password and ensure role is STUDENT
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password: hashedPassword,
        role: existingUser.role === 'STUDENT' ? existingUser.role : 'STUDENT',
        isActive: true,
      },
    });
    console.log(`Updated existing user ${data.email} with new temp password`);
    return { user: updatedUser, tempPassword };
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.fullName,
      phone: data.phoneNumber,
      password: hashedPassword,
      role: "STUDENT",
      isActive: true,
    },
  });

  console.log(`Created new student user ${data.email} with ID ${user.id}`);
  return { user, tempPassword };
}