import { NextResponse } from "next/server";

// Authoritative Python FastAPI analytics engine base URL
const BACKEND_BASE_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

/**
 * Proxies an API request from Next.js serverless route to the authoritative Python FastAPI backend.
 * Guarantees a single source of truth for all statistical, cleaning, and segmentation operations.
 * If backend is temporarily unreachable and a fallbackFn is provided (e.g. initial demo preview),
 * it gracefully invokes the fallback.
 */
export async function proxyToBackend(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  body?: any,
  fallbackFn?: () => Promise<any>
) {
  try {
    const url = `${BACKEND_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    };

    if (body !== undefined && method === "POST") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      if (fallbackFn) {
        try {
          const fallbackData = await fallbackFn();
          return NextResponse.json(fallbackData);
        } catch {
          // Ignore fallback error and return backend status
        }
      }
      const errText = await response.text();
      return NextResponse.json(
        { error: `Authoritative Backend Error (${response.status}): ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    if (fallbackFn) {
      try {
        const fallbackData = await fallbackFn();
        return NextResponse.json(fallbackData);
      } catch (fallbackErr: any) {
        return NextResponse.json(
          { error: `Backend unavailable at ${BACKEND_BASE_URL} and fallback failed: ${fallbackErr.message}` },
          { status: 502 }
        );
      }
    }
    return NextResponse.json(
      { error: `Authoritative analytics backend unreachable at ${BACKEND_BASE_URL}. Ensure FastAPI is running.` },
      { status: 502 }
    );
  }
}
