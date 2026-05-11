import { NextResponse } from "next/server";

/**
 * Throw inside a `prisma.$transaction` callback to abort the tx and bubble
 * up a JSON error response with the given status code. Caller does:
 *
 *   try {
 *     await prisma.$transaction(async (tx) => {
 *       if (!ok) throw new HttpError(400, "...");
 *     });
 *   } catch (err) {
 *     if (err instanceof HttpError) return httpErrorResponse(err);
 *     // unexpected — log + return 500
 *   }
 */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export function httpErrorResponse(err: HttpError) {
  return NextResponse.json({ error: err.message }, { status: err.status });
}
