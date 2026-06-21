import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserFromToken, AuthError } from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';

type UserRole = 'ADMIN' | 'EMPLOYEE' | 'MENTOR' | 'STUDENT';

/**
 * Extract the auth token from the request (Authorization header or auth-token cookie).
 * Returns null if no token is found.
 */
export function extractToken(request: NextRequest): string | null {
  return (
    request.headers.get('Authorization')?.replace('Bearer ', '') ||
    request.cookies.get('auth-token')?.value ||
    null
  );
}

/**
 * Authenticate a request and verify the user has an allowed role.
 * Returns the authenticated user payload or a NextResponse error.
 */
export async function authenticateRequest(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<
  | { success: true; user: Awaited<ReturnType<typeof getUserFromToken>> }
  | { success: false; response: NextResponse }
> {
  const token = extractToken(request);

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  try {
    const user = await getUserFromToken(token);

    if (!user || !allowedRoles.includes(user.role as UserRole)) {
      return {
        success: false,
        response: NextResponse.json(
          { error: `${allowedRoles.join(' or ')} access required` },
          { status: 403 }
        ),
      };
    }

    return { success: true, user };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        response: NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        ),
      };
    }
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Authenticate using only JWT verification (no DB lookup).
 * Lighter than authenticateRequest for routes that don't need full user data.
 */
export function authenticateRequestLight(
  request: NextRequest,
  allowedRoles: UserRole[]
):
  | { success: true; payload: JWTPayload }
  | { success: false; response: NextResponse } {
  const token = extractToken(request);

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  try {
    const payload = verifyToken(token);

    if (!allowedRoles.includes(payload.role)) {
      return {
        success: false,
        response: NextResponse.json(
          { error: `${allowedRoles.join(' or ')} access required` },
          { status: 403 }
        ),
      };
    }

    return { success: true, payload };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        response: NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        ),
      };
    }
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Standard API error response handler.
 * Logs the error and returns a consistent JSON error response.
 */
export function handleApiError(
  error: unknown,
  context: string
): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  console.error(`Error ${context}:`, error);
  return NextResponse.json(
    { error: `Failed to ${context}` },
    { status: 500 }
  );
}

/**
 * Standard success response with consistent shape.
 */
export function successResponse(data: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json({ success: true, ...data }, { status });
}
